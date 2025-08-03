/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: { email: 'test@example.com', passwordHash: hashedPassword },
  });

  await prisma.note.createMany({
    data: [
      { userId: user.id, title: 'Note 1', body: 'Body 1' },
      { userId: user.id, title: 'Note 2', body: 'Body 2' },
      { userId: user.id, title: 'Note 3', body: 'Body 3' },
      { userId: user.id, title: 'Note 4', body: 'Body 4' },
      { userId: user.id, title: 'Note 5', body: 'Body 5' },
    ],
  });
  console.log('Seeding completed: Test user and 5 notes created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })
