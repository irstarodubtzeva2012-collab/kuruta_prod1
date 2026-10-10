import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@kuruta/database';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status === 'blocked' || user.status === 'deleted') {
      throw new UnauthorizedException('Account is blocked or deleted');
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map(r => r.role),
    };
  }
}
