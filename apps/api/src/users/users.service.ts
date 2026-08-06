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
    if (!dto.email) {
      return this.findPublicById(id);
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing && existing.id !== id) {
      throw new ConflictException({ code: "CONFLICT", message: "Email is already in use" });
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { email: dto.email },
    });
    return this.toPublicUser(updated);
  }

  private toPublicUser(user: User) {
    return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}
