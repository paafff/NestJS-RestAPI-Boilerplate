import { Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { faker } from '@faker-js/faker';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createOne(userCreateArgs: CreateUserDto) {
    // Hash password
    const hashedPassword = await bcrypt.hash(userCreateArgs.password, 10);

    const username = userCreateArgs.email.split('@')[0];

    const createdUser = await this.prisma.user.create({
      data: {
        ...userCreateArgs,
        password: hashedPassword,
        username: username,
      },
    });

    return createdUser;
  }
  async findMany() {
    return await this.prisma.user.findMany({
      // include: {
      //   address: true,
      // },
      select: {
        email: true,
        address: {
          select: {
            street: true,
            city: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  // Update a user by ID
  async updateOne(id: string, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteOne(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }
}
