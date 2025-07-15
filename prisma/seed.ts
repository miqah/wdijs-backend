import { PrismaClient } from '@prisma/client';
import { createJapaneseLanguage } from './seeder/japanese';

const prisma = new PrismaClient();

async function main() {
  await createJapaneseLanguage(prisma);
  console.log('Seeding complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
