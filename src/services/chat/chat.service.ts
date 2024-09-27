// src/bitcoin/bitcoin.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { MailService } from '../mail/mail.service';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  constructor(private readonly mailerService: MailService) {}

  private async fetchBitcoinPrice(): Promise<number> {
    try {
      const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
        {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
          },
          params: {
            start: 1,
            limit: 1,
            convert: 'USD',
          },
        },
      );
      const bitcoin = response.data.data[0];
      return bitcoin.quote.USD.price;
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      throw error;
    }
  }

  private async fetchChatGPTResponse(prompt: string): Promise<string> {
    try {
      const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENAI_API_KEY,
        defaultHeaders: {
          'HTTP-Referer': process.env.YOUR_SITE_URL, // Optional, for including your app on openrouter.ai rankings.
          'X-Title': process.env.YOUR_SITE_NAME, // Optional. Shows in rankings on openrouter.ai.
        },
      });

      const completion = await openai.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching ChatGPT response:', error);
      throw error;
    }
  }

  public async fetchAndSendBitcoinPrice(prompt: string) {
    try {
      const price = await this.fetchBitcoinPrice();
      console.log(
        '🚀 ~ ChatService ~ fetchAndSendBitcoinPrice ~ price:',
        price,
      );
      const currentDateTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Singapore',
      });

      const fullPrompt = `make simple narrative text to give the information current price of Bitcoin is $${price} at this time ${currentDateTime}.`;
      // const fullPrompt = `${prompt} The current price of Bitcoin is $${price}.please known with this information is from gpt.`;
      // const fullPrompt = `The current price of Bitcoin is $${price}. Please send an email to shawn@mugglepay.com with this information.`;

      let emailToSend = '';
      let chatGPTResponse = '';

      // Regex untuk mengekstrak alamat email dari prompt
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      const emailMatch = prompt.match(emailRegex);

      if (emailMatch) {
        emailToSend = emailMatch[0];
      }

      if (
        prompt.toLowerCase().includes('price') &&
        (prompt.toLowerCase().includes('bitcoin') ||
          prompt.toLowerCase().includes('btc'))
      ) {
        chatGPTResponse = await this.fetchChatGPTResponse(fullPrompt);
      } else {
        chatGPTResponse = await this.fetchChatGPTResponse(prompt);
      }

      if (/\S+@\S+\.\S+/.test(prompt)) {
        emailToSend = prompt;
      }

      if (emailToSend !== '' && chatGPTResponse !== '') {
        const mailOptions = {
          to: emailToSend || 'danang050402@gmail.com',
          subject: 'Bitcoin Price Alert',
          text: chatGPTResponse,
        };

        await this.mailerService.sendEmail(mailOptions);
      }
      console.log(
        '🚀 ~ ChatService ~ fetchAndSendBitcoinPrice ~ emailToSend:',
        emailToSend,
      );

      return chatGPTResponse;
    } catch (error) {
      console.error('Error in fetchAndSendBitcoinPrice:', error);
    }
  }
}
