import { Module } from '@nestjs/common';
import { InitializationService } from './initialization.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  exports: [InitializationService],
  providers: [InitializationService],
  imports: [PrismaModule],
})
export class InitializationModule {}
