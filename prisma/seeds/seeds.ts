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

  const addressCreateManyInput: Prisma.AddressCreateManyInput[] = Array.from({
    length: records / 1,
  }).map((_, index) => {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      // userId: userCreateManyInput[index % userCreateManyInput.length].id,
      userId: userCreateManyInput[Math.floor(index / 10)].id,
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

        await prisma.address
          .createMany({
            data: addressCreateManyInput,
          })
          .catch((error) => {
            console.error('Error creating address', error);
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
