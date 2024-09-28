// src/bitcoin/bitcoin.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('fetch-coins')
  async fetchCoinsPrice(@Body('prompt') prompt: string): Promise<string> {
    return await this.chatService.fetchAndSendCoinsPrice(prompt);
  }

  @Post('fetch-coin')
  async fetchCoinPrice(@Body('prompt') prompt: string): Promise<string> {
    return await this.chatService.fetchAndSendCoinPrice(prompt);
  }
}
