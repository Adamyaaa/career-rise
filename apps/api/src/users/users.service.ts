import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateMeDto } from "./dto/update-me.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException({ code: "NOT_FOUND", message: "User not found" });
    }
    return this.toPublicUser(user);
  }

  async updateMe(id: string, dto: UpdateMeDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException({ code: "CONFLICT", message: "Email is already in use" });
      }
    }

    // Only fields actually present in the request are touched, so a partial PATCH
    // can't blank out a name the caller didn't mention.
    const data = {
      ...(dto.email ? { email: dto.email } : {}),
      ...(dto.firstName !== undefined ? { firstName: dto.firstName.trim() } : {}),
      ...(dto.lastName !== undefined ? { lastName: dto.lastName.trim() } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
    };

    if (Object.keys(data).length === 0) {
      return this.findPublicById(id);
    }

    const updated = await this.prisma.user.update({ where: { id }, data });
    return this.toPublicUser(updated);
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }
}
