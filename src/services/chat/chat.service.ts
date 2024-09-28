// src/bitcoin/bitcoin.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { MailService } from '../mail/mail.service';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly mailerService: MailService,
    private readonly prismaService: PrismaService,
  ) {}

  // private async top10Tokens() {
  //   try {
  //     const response = await axios.get(
  //       `https://pro-api.coinmarketcap.com/v1/cryptocurrency/trending/latest`,
  //       {
  //         headers: {
  //           'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
  //         },
  //         params: {
  //           start: 1,
  //           limit: 20,
  //           convert: 'USD',
  //         },
  //       },
  //     );
  //     console.log(
  //       '🚀 ~ ChatService ~ top10Tokens ~ response.data:',
  //       response.data,
  //     );
  //   } catch (error) {
  //     if (error.response) {
  //       // Server responded with a status other than 200 range
  //       console.error('Error fetching top 10 tokens:', error.response.data);
  //     } else if (error.request) {
  //       // Request was made but no response was received
  //       console.error('Error fetching top 10 tokens:', error.request);
  //     } else {
  //       // Something happened in setting up the request
  //       console.error('Error fetching top 10 tokens:', error.message);
  //     }
  //     throw error;
  //   }
  // }

  private async top10Tokens() {
    try {
      const response = await axios.get(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
          },
          params: {
            start: 1,
            limit: 10,
            convert: 'USD',
          },
        },
      );
      console.log(
        '🚀 ~ ChatService ~ top10Tokens ~ response.data:',
        response.data,
      );

      const top10Tokens = response.data.data.map((coin: any) => {
        return {
          name: coin.name,
          symbol: coin.symbol,
          price: coin.quote.USD.price,
        };
      });
      console.log('🚀 ~ ChatService ~ top10Tokens ~ top10Tokens:', top10Tokens);

      return top10Tokens;
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 200 range
        console.error('Error fetching top 10 tokens:', error.response.data);
      } else if (error.request) {
        // Request was made but no response was received
        console.error('Error fetching top 10 tokens:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error fetching top 10 tokens:', error.message);
      }
      throw error;
    }
  }

  private async fetchLatestListingCoinPrice(): Promise<number> {
    try {
      const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
        {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
          },
          params: {
            start: 1,
            limit: 20,
            convert: 'USD',
          },
        },
      );
      console.log(
        '🚀 ~ ChatService ~ fetchLatestListingCoinPrice ~ response:',
        response.data,
      );
      const bitcoin = response.data.data[0];
      console.log(
        '🚀 ~ ChatService ~ fetchLatestListingCoinPrice ~ bitcoin:',
        bitcoin,
      );
      return bitcoin.quote.USD.price;
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      throw error;
    }
  }

  private async fetchCoinPrice(coin: string): Promise<number> {
    console.log('🚀 ~ ChatService ~ fetchCoinPrice ~ coin:', coin);
    try {
      const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
          },
          params: {
            symbol: coin.toUpperCase(),
            convert: 'USD',
          },
        },
      );
      const coinData = response.data.data[coin.toUpperCase()];
      console.log(
        '🚀 ~ ChatService ~ fetchCoinPrice ~ response.data:',
        response.data,
      );
      return coinData.quote.USD.price;
    } catch (error) {
      console.error('Error fetching coin price:', error);
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

  public async fetchAndSendCoinsPrice(prompt: string) {
    try {
      const price = await this.fetchLatestListingCoinPrice();
      console.log('🚀 ~ ChatService ~ fetchAndSendCoinPrice ~ price:', price);
      const currentDateTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Singapore',
      });

      const fullPrompt = `make simple narrative text to give the information current price of Bitcoin is $${price} at this time ${currentDateTime}.`;

      // shawn@mugglepay.com with this information.`;

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
        '🚀 ~ ChatService ~ fetchAndSendCoinPrice ~ emailToSend:',
        emailToSend,
      );

      return chatGPTResponse;
    } catch (error) {
      console.error('Error in fetchAndSendCoinPrice:', error);
    }
  }

  //=======================================================================================================

  public async fetchAndSendCoinPrice(prompt: string) {
    try {
      // Pisahkan kata-kata dalam prompt menggunakan regex untuk menangani koma dan spasi
      const words = prompt.split(/[\s,]+/);

      let extractedCoins: { symbol: string; name: string }[] = [];
      for (const word of words) {
        const coinFromPromptDetected =
          await this.prismaService.crypto.findFirst({
            where: {
              OR: [
                {
                  name: {
                    equals: word,
                    mode: 'insensitive',
                  },
                },
                {
                  symbol: {
                    equals: word,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          });

        if (coinFromPromptDetected) {
          extractedCoins.push({
            symbol: coinFromPromptDetected.symbol,
            name: coinFromPromptDetected.name,
          });
        }
      }

      console.log(
        '🚀 ~ ChatService ~ fetchAndSendCoinPrice ~ extractedCoins:',
        extractedCoins,
      );

      let prices: { symbol: string; price: number }[] = [];
      for (const coin of extractedCoins) {
        const price = await this.fetchCoinPrice(coin.symbol);
        prices.push({ symbol: coin.symbol, price });
        console.log(
          `🚀 ~ ChatService ~ fetchAndSendCoinPrice ~ ${coin.symbol} price:`,
          price,
        );
      }

      const currentDateTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Singapore',
      });

      let fullPrompt =
        'make simple narrative text to give the information current price of ';
      fullPrompt += prices.map((p) => `${p.symbol} is $${p.price}`).join(', ');
      fullPrompt += ` at this time ${currentDateTime}.`;

      let emailToSend = '';
      let chatGPTResponse = '';

      // Regex untuk mengekstrak alamat email dari prompt
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      const emailMatch = prompt.match(emailRegex);

      if (emailMatch) {
        emailToSend = emailMatch[0];
      }

      if (extractedCoins.length > 0) {
        chatGPTResponse = await this.fetchChatGPTResponse(fullPrompt);
      } else if (
        prompt.includes('current date') ||
        prompt.includes(`date is today`)
      ) {
        chatGPTResponse = await this.fetchChatGPTResponse(
          `just give the information current date is ${currentDateTime}.`,
        );
      } else if (prompt.includes('top 10 tokens')) {
        const tokens = await this.top10Tokens();
        console.log(
          '🚀 ~ ChatService ~ fetchAndSendCoinPrice ~ tokens:',
          JSON.stringify(tokens, null, 1),
        );
        const promptTopTokens = `make narrative text to give the information top 10 tokens from this json data ${JSON.stringify(tokens)} at this time ${currentDateTime}.`;

        chatGPTResponse = await this.fetchChatGPTResponse(promptTopTokens);
      } else {
        chatGPTResponse = await this.fetchChatGPTResponse(prompt);
      }

      if (/\S+@\S+\.\S+/.test(prompt)) {
        emailToSend = prompt;
      }

      if (emailToSend !== '' && chatGPTResponse !== '') {
        const mailOptions = {
          to: emailToSend,
          subject: `Price Alert`,
          text: chatGPTResponse,
        };

        await this.mailerService.sendEmail(mailOptions);
      }

      console.log(
        '🚀 ~ ChatService ~ fetchAndSendCoinPrice ~ emailToSend:',
        emailToSend,
      );

      return chatGPTResponse;
    } catch (error) {
      console.error('Error in fetchAndSendCoinPrice:', error);
    }
  }
}
