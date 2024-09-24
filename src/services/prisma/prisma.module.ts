import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // Sesuaikan path sesuai struktur direktori Anda

@Module({
  providers: [PrismaService],
  imports: [PrismaModule],
  exports: [PrismaService], // Export PrismaService agar dapat digunakan di module lain
})
export class PrismaModule {}
