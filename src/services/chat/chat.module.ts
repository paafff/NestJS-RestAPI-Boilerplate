import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [ChatService],
  exports: [],
  imports: [MailModule,PrismaModule],
  controllers: [ChatController],
})
export class ChatModule {}
