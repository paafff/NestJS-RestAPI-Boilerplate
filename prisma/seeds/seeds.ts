import { Prisma, PrismaClient, RoleEnum } from '@prisma/client';
import { join } from 'path';
import * as fs from 'fs/promises';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

let prisma = new PrismaClient();

export async function Seeds() {
  const records: number = 100;

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
