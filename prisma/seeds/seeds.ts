import { Prisma, PrismaClient, RoleEnum } from '@prisma/client';
import { join } from 'path';
import * as fs from 'fs/promises';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

let prisma = new PrismaClient();

export async function Seeds() {
  const records: number = 100;

  // Membaca dan memparsing data dari cryptos.json
  const cryptosFilePath = join('prisma/seeds/cryptos.json');
  const cryptosData = await fs.readFile(cryptosFilePath, 'utf-8');
  const cryptos = JSON.parse(cryptosData);

  const userCreateManyInput: Prisma.UserCreateManyInput[] = Array.from({
    length: records / 10,
  }).map((_, index) => {
    const username = faker.internet.userName();
    const hashedPassword = bcrypt.hashSync('123456', 10);

    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      password: hashedPassword,
      username: username,
      role: faker.helpers.objectValue(RoleEnum),
    };
  });

  const cryptoCreateManyInput: Prisma.CryptoCreateManyInput[] = cryptos
    .filter(
      (crypto: any) => crypto.id && crypto.name && crypto.symbol && crypto.icon,
    )
    .map((crypto: any) => {
      return {
        idCrypto: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        icon: crypto.icon,
      };
    });

  try {
    console.log('🚀 ~ Seeds Start... ');

    await prisma.$transaction(
      async (prisma) => {
        await prisma.user
          .createMany({
            data: userCreateManyInput,
          })
          .catch((error) => {
            console.error('Error creating user', error);
            throw error;
          });

        await prisma.crypto
          .createMany({
            data: cryptoCreateManyInput,
          })
          .catch((error) => {
            console.error('Error creating crypto', error);
            throw error;
          });
      },
      {
        maxWait: 100000, // default: 2000
        timeout: 20000000, // default: 5000
      },
    );
  } catch (error) {
    console.error('Seeding error', error);
  } finally {
    console.log('🚀 ~ Seeds Completed... ');
    await prisma.$disconnect();
  }

  //================================================================================================
}
