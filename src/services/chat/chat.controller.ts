// src/bitcoin/bitcoin.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('bitcoin-price')
  async sendBitcoinPrice(@Body('prompt') prompt: string): Promise<string> {
    return await this.chatService.fetchAndSendBitcoinPrice(prompt);
  }
}
