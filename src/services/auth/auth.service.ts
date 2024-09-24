import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    // private readonly userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    // console.log('🚀 ~ AuthService ~ validateUser ~ email:', email);
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // console.log('🚀 ~ AuthService ~ validateUser ~ user:', user);
    if (user && (await bcrypt.compare(password, user.password))) {
      //exclude password from user object
      const { password, ...result } = user;
      console.log('🚀 ~ AuthService ~ validateUser ~ result:', result);
      return result;
    }

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      //subject
      sub: {
        email: user.email,
        // username: user.username,
      },
    };

    return {
      ...user,
      //this is the access token expires in 60 seconds
      accessToken: this.jwtService.sign(payload, { expiresIn: '6000s' }),
      //this is the refresh token expires in 7 days
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refreshToken(user: User) {
    const payload = {
      username: user.email,
      sub: {
        email: user.email,
        // username: user.username,
      },
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
