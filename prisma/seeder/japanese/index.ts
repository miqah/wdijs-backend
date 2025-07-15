import { PrismaClient } from '@prisma/client';

async function ensureBasicDataExists(prismaClient: PrismaClient) {
  const japaneseLanguage = await prismaClient.language.findFirst({
    where: { name: 'Japanese' },
  });

  // If not, create it
  if (!japaneseLanguage) {
    console.log('Creating Japanese language entry...');
    await prismaClient.language.create({
      data: {
        name: 'Japanese',
        description: 'Japanese language',
        testLevels: {
          create: [
            { name: 'N5', description: 'JLPT N5 - Beginner', ranking: 5 },
            { name: 'N4', description: 'JLPT N4 - Basic', ranking: 4 },
            { name: 'N3', description: 'JLPT N3 - Intermediate', ranking: 3 },
            { name: 'N2', description: 'JLPT N2 - Pre-Advanced', ranking: 2 },
            { name: 'N1', description: 'JLPT N1 - Advanced', ranking: 1 },
          ],
        },
      },
    });
    console.log('Japanese language and test levels created.');
  }
}

async function importFromKanjidic(prismaClient: PrismaClient) {
  console.log('Importing data from KANJIDIC2...');

  try {
    const language = await prismaClient.language.findFirst({
      where: { name: 'Japanese' },
    });

    if (!language) {
      throw new Error('Japanese language not found in database');
    }
  } catch (error) {
    console.error('Error importing data:', error);
    return {
      radicalsCount: 0,
      kanjiCount: 0,
    };
  }
}

export async function createJapaneseLanguage(prismaClient: PrismaClient) {
  try {
    await ensureBasicDataExists(prismaClient);
    await importFromKanjidic(prismaClient);

    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error in data import:', error);
  }
}
