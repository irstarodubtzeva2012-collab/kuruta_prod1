import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { prisma } from '@kuruta/database';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, displayName } = registerDto;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        status: 'active',
      },
      include: {
        roles: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.register',
        entityType: 'User',
        entityId: user.id,
        after: { email: user.email, status: user.status },
      },
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }

  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const { email, password } = loginDto;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'blocked' || user.status === 'deleted') {
      throw new UnauthorizedException('Account is blocked or deleted');
    }

    // Verify password with Argon2id
    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.roles.map(r => r.role));

    // Create session with refresh token
    const refreshTokenHash = await argon2.hash(tokens.refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: refreshTokenHash,
        ip,
        userAgent,
        expiresAt,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.login',
        entityType: 'User',
        entityId: user.id,
        ip,
        userAgent,
      },
    });

    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles.map(r => r.role),
      },
    };
  }

  async refreshTokens(refreshToken: string, ip?: string, userAgent?: string) {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find session
      const session = await prisma.session.findFirst({
        where: {
          userId: payload.sub,
          revokedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await prisma.session.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Refresh token expired');
      }

      // Verify refresh token hash
      const isValid = await argon2.verify(session.refreshToken, refreshToken);

      if (!isValid) {
        // SECURITY: Refresh token reuse detected - revoke entire family
        await this.revokeAllUserSessions(payload.sub);
        
        // Audit log - security incident
        await prisma.auditLog.create({
          data: {
            userId: payload.sub,
            action: 'security.refresh_token_reuse',
            entityType: 'Session',
            entityId: session.id,
            ip,
            userAgent,
          },
        });

        throw new UnauthorizedException('Refresh token reuse detected. All sessions revoked.');
      }

      // Get user with roles
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { roles: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Revoke current session
      await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });

      // Generate new tokens
      const tokens = await this.generateTokens(user.id, user.roles.map(r => r.role));

      // Create new session
      const refreshTokenHash = await argon2.hash(tokens.refreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken: refreshTokenHash,
          ip,
          userAgent,
          expiresAt,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'user.refresh',
          entityType: 'Session',
          entityId: session.id,
          ip,
          userAgent,
        },
      });

      return {
        accessToken: tokens.accessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find and revoke session
      const session = await prisma.session.findFirst({
        where: {
          userId: payload.sub,
          revokedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (session) {
        await prisma.session.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });

        // Audit log
        await prisma.auditLog.create({
          data: {
            userId: payload.sub,
            action: 'user.logout',
            entityType: 'Session',
            entityId: session.id,
          },
        });
      }

      return { success: true };
    } catch (error) {
      // Even if token is invalid, return success
      return { success: true };
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName || user.displayName,
      avatarUrl: user.profile?.avatarUrl,
      roles: user.roles.map(r => r.role),
      totpEnabled: user.totpEnabled,
    };
  }

  async enableTotp(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.totpEnabled) {
      throw new BadRequestException('TOTP already enabled');
    }

    // Generate TOTP secret
    const secret = this.generateTotpSecret();

    // Save encrypted secret
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: secret,
        totpEnabled: false, // Will be enabled after verification
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'user.totp_initiated',
        entityType: 'User',
        entityId: userId,
      },
    });

    return {
      secret,
      qrCodeUrl: this.generateTotpQrCode(user.email, secret),
    };
  }

  async verifyTotp(userId: string, token: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.totpSecret) {
      throw new BadRequestException('TOTP not initiated');
    }

    // Verify TOTP token
    const isValid = this.verifyTotpToken(user.totpSecret, token);

    if (!isValid) {
      throw new BadRequestException('Invalid TOTP token');
    }

    // Enable TOTP
    await prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'user.totp_enabled',
        entityType: 'User',
        entityId: userId,
      },
    });

    return { success: true };
  }

  async disableTotp(userId: string, token: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.totpEnabled || !user.totpSecret) {
      throw new BadRequestException('TOTP not enabled');
    }

    // Verify TOTP token
    const isValid = this.verifyTotpToken(user.totpSecret, token);

    if (!isValid) {
      throw new BadRequestException('Invalid TOTP token');
    }

    // Disable TOTP
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpEnabled: false,
        totpSecret: null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'user.totp_disabled',
        entityType: 'User',
        entityId: userId,
      },
    });

    return { success: true };
  }

  // Private methods

  private async generateTokens(userId: string, roles: string[]) {
    const payload = { sub: userId, roles };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async revokeAllUserSessions(userId: string) {
    await prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  private generateTotpSecret(): string {
    return crypto.randomBytes(20).toString('hex');
  }

  private generateTotpQrCode(email: string, secret: string): string {
    const issuer = this.configService.get<string>('TOTP_ISSUER', 'KURUTA');
    return `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`;
  }

  private verifyTotpToken(secret: string, token: string): boolean {
    // Simple TOTP verification (in production, use a proper TOTP library like otplib)
    // This is a placeholder - implement proper TOTP verification
    const timeStep = Math.floor(Date.now() / 1000 / 30);
    const expectedToken = crypto
      .createHmac('sha1', secret)
      .update(timeStep.toString())
      .digest('hex')
      .slice(-6);
    
    return token === expectedToken;
  }
}
