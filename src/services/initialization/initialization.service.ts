import { Injectable } from '@nestjs/common';
import { Seeds } from 'prisma/seeds/seeds';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class InitializationService {
  constructor(private readonly prisma: PrismaService) {
    console.log('InitializationService initialized');
  }

  async initialize() {
    const users = await this.prisma.user.findMany();

    try {
      if (users.length <= 0) {
        console.log(
          `🚀 ~ InitializationService ~ initialize ~ Seeding dev akan dijalankan`,
        );

        await Seeds();
      }
    } catch (error) {
      console.log('🚀 ~ InitializationService ~ initialize ~ error', error);
    }
  }
}
