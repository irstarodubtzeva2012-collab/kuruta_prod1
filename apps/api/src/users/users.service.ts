import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@kuruta/database';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  async findById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...updateProfileDto,
      },
      update: updateProfileDto,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'user.profile_updated',
        entityType: 'UserProfile',
        entityId: profile.id,
        before: { displayName: user.displayName },
        after: updateProfileDto,
      },
    });

    return profile;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldAvatarUrl = user.profile?.avatarUrl;

    // Update or create profile with avatar
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        avatarUrl,
      },
      update: {
        avatarUrl,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'user.avatar_updated',
        entityType: 'UserProfile',
        entityId: profile.id,
        before: { avatarUrl: oldAvatarUrl },
        after: { avatarUrl },
      },
    });

    return profile;
  }

  async getProfile(userId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    return profile;
  }
}
