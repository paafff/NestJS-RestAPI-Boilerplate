import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatService],
  exports: [],
  imports: [MailModule],
  controllers: [ChatController],
})
export class ChatModule {}
