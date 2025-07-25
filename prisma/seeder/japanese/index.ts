import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';
import * as zlib from 'zlib';
import { seedBaseBot } from './methods/seedBaseBot';
import { seedJMDict } from './methods/seedJmDict';

async function ensureBasicDataExists(prismaClient: PrismaClient) {
  const japaneseLanguage = await prismaClient.language.findFirst({
    where: { name: 'Japanese' },
  });
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

  const learningStages = [
    {
      stageName: 'Hajimete',
      description: 'Just encountered (初めて) - First time seeing this item.',
      stayDuration: 0,
      interval: 0,
    },
    {
      stageName: 'Manabu',
      description: 'Learning (学ぶ) - Memorization phase. Review soon.',
      stayDuration: 1,
      interval: 1,
    },
    {
      stageName: 'Fukushuu',
      description: 'Review (復習) - First review interval.',
      stayDuration: 1,
      interval: 2,
    },
    {
      stageName: 'Jōren',
      description: 'Regular (常連) - Building memory with regular reviews.',
      stayDuration: 2,
      interval: 4,
    },
    {
      stageName: 'Nareteiru',
      description:
        'Familiar (慣れている) - Getting comfortable with this content.',
      stayDuration: 3,
      interval: 7,
    },
    {
      stageName: 'Senpai',
      description: 'Mastery nearing (先輩) - Becoming an expert!',
      stayDuration: 5,
      interval: 14,
    },
    {
      stageName: 'Kami',
      description: 'Legendary (神) - Mastered, review rarely needed.',
      stayDuration: 7,
      interval: 30,
    },
  ];

  for (const stage of learningStages) {
    await prismaClient.learningStage.upsert({
      where: { stageName: stage.stageName },
      create: stage,
      update: {},
    });
    console.log(`LearningStage "${stage.stageName}" checked/created.`);
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
    const gzippedFilePath = path.join(__dirname, 'kanjidic2.xml.gz');
    console.log('Looking for file at:', gzippedFilePath);
    if (!fs.existsSync(gzippedFilePath)) {
      throw new Error(`File not found at path: ${gzippedFilePath}`);
    }
    const decompressedFilePath = path.join(__dirname, 'kanjidic2.xml');
    let xmlData: string;
    // Check if decompressed file already exists
    if (fs.existsSync(decompressedFilePath)) {
      console.log('Using existing decompressed XML file...');
      xmlData = fs.readFileSync(decompressedFilePath, 'utf-8');
    } else {
      console.log('Decompressing gzipped XML file...');
      // Read and decompress the gzipped file
      const compressedData = fs.readFileSync(gzippedFilePath);
      xmlData = zlib.gunzipSync(compressedData).toString('utf-8');
      // Save the decompressed file for future use
      fs.writeFileSync(decompressedFilePath, xmlData);
      console.log('Decompressed file saved to:', decompressedFilePath);
    }

    console.log('Parsing XML data...');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name) =>
        ['character', 'reading', 'meaning', 'nanori', 'rad_value'].includes(
          name,
        ),
    });
    const result = parser.parse(xmlData);
    const characters = result.kanjidic2.character || [];
    console.log(`Found ${characters.length} kanji characters in KANJIDIC2`);
    // Process all kanji
    console.log('Creating kanji characters...');
    // Process in batches to avoid overwhelming the database
    const batchSize = 100;
    let kanjiCount = 0;
    for (let i = 0; i < characters.length; i += batchSize) {
      const batch = characters.slice(i, i + batchSize);
      for (const character of batch) {
        const literal = character.literal;
        if (!literal) continue;
        // Check if kanji already exists
        const existingKanji = await prismaClient.kanji.findFirst({
          where: { character: literal },
        });
        if (existingKanji) {
          console.log(`Kanji ${literal} already exists, skipping...`);
          continue;
        }
        // Extract readings - fixing the path to correctly access the readings
        let onyomiReadings: string[] = [];
        let kunyomiReadings: string[] = [];
        let nanoriReadings: string[] = [];
        // Handle readings that might be in rmgroup structure
        if (character.reading_meaning?.rmgroup?.reading) {
          // Handle readings in rmgroup structure
          onyomiReadings = character.reading_meaning.rmgroup.reading
            .filter((r) => r['@_r_type'] === 'ja_on')
            .map((r) => r['#text']);
          kunyomiReadings = character.reading_meaning.rmgroup.reading
            .filter((r) => r['@_r_type'] === 'ja_kun')
            .map((r) => r['#text']);
        } else if (character.reading) {
          // Fallback to direct reading array if available
          onyomiReadings = character.reading
            .filter((r) => r['@_r_type'] === 'ja_on')
            .map((r) => r['#text']);
          kunyomiReadings = character.reading
            .filter((r) => r['@_r_type'] === 'ja_kun')
            .map((r) => r['#text']);
        }
        if (character.nanori) {
          nanoriReadings = character.nanori.map((n) => n['#text']);
        }

        // Extract meanings - properly handling different possible structures
        let meanings = '';
        if (character.reading_meaning?.rmgroup?.meaning) {
          // Handle array of meanings
          if (Array.isArray(character.reading_meaning.rmgroup.meaning)) {
            meanings = character.reading_meaning.rmgroup.meaning
              .filter((m) => !m['@_m_lang'] || m['@_m_lang'] === 'en')
              .map((m) => (typeof m === 'string' ? m : m['#text']))
              .join(', ');
          }
          // Handle single meaning
          else if (
            typeof character.reading_meaning.rmgroup.meaning === 'object'
          ) {
            meanings = character.reading_meaning.rmgroup.meaning['#text'] || '';
          }
          // Handle direct string value
          else {
            meanings = character.reading_meaning.rmgroup.meaning;
          }
        }
        // Try direct meaning array if available
        else if (character.meaning) {
          // Handle array of meanings
          if (Array.isArray(character.meaning)) {
            meanings = character.meaning
              .filter((m) => !m['@_m_lang'] || m['@_m_lang'] === 'en')
              .map((m) => (typeof m === 'string' ? m : m['#text']))
              .join(', ');
          }
          // Handle single meaning object
          else if (typeof character.meaning === 'object') {
            meanings = character.meaning['#text'] || '';
          }
          // Handle direct string value
          else {
            meanings = character.meaning;
          }
        }

        // JLPT level (if available)
        let jlptLevel: number | null = null;
        if (character.misc?.jlpt) {
          jlptLevel = parseInt(character.misc.jlpt, 10);
        }
        // Grade level (school grade)
        let grade: number | null = null;
        if (character.misc?.grade) {
          grade = parseInt(character.misc.grade, 10);
        }
        // Frequency information
        let frequency: number | null = null;
        if (character.misc?.freq) {
          frequency = parseInt(character.misc.freq, 10);
        }
        // Stroke count
        const strokeCount = parseInt(character.misc?.stroke_count || '0', 10);

        try {
          // Create the kanji entry - without connecting radicals or creating words
          await prismaClient.kanji.create({
            data: {
              character: literal,
              grade,
              frequency,
              jlptLevel,
              strokeCount: strokeCount,
              // Create readings
              onyomiReadings: {
                create: onyomiReadings.map((reading) => ({ reading })),
              },
              kunyomiReadings: {
                create: kunyomiReadings.map((reading) => ({ reading })),
              },
              nanoriReadings: {
                create: nanoriReadings.map((reading) => ({ reading })),
              },
            },
          });
          kanjiCount++;
        } catch (err) {
          console.error(`Error creating kanji ${literal}:`, err);
        }
      }
      console.log(
        `Processed ${i + batch.length} out of ${characters.length} kanji characters...`,
      );
    }
    console.log(`Import completed. Created ${kanjiCount} kanji characters.`);
    return {
      kanjiCount,
    };
  } catch (error) {
    console.error('Error importing data:', error);
    return {
      radicalsCount: 0,
      kanjiCount: 0,
    };
  }
}

/**
 * Parse the kradfile to get kanji -> radicals mapping
 */
/**
 * Parse the kradfile to get kanji -> radicals mapping (UTF-8 version)
 */
async function parseKradFile(filePath: string): Promise<Map<string, string[]>> {
  console.log(`Parsing file: ${filePath}...`);
  const kanjiToRadicals = new Map<string, string[]>();

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // Read the file directly as UTF-8
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse the file content
    const lines = fileContent.split('\n');
    let parsedLines = 0;

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.startsWith('#') || !line.trim()) {
        continue;
      }

      // Parse lines in the format: kanji : radical1 radical2 ...
      const parts = line.trim().split(' : ');
      if (parts.length === 2) {
        const kanji = parts[0].trim();
        const radicals = parts[1]
          .trim()
          .split(' ')
          .filter((r) => r);
        kanjiToRadicals.set(kanji, radicals);
        parsedLines++;
      }
    }

    console.log(
      `Parsed ${parsedLines} kanji entries from ${path.basename(filePath)}`,
    );
  } catch (error) {
    console.error(`Error parsing ${path.basename(filePath)}:`, error);
  }

  return kanjiToRadicals;
}

/**
 * Merge multiple kanji to radicals mappings
 */
function mergeKanjiRadicalMappings(
  ...mappings: Map<string, string[]>[]
): Map<string, string[]> {
  const merged = new Map<string, string[]>();

  for (const mapping of mappings) {
    for (const [kanji, radicals] of mapping.entries()) {
      if (merged.has(kanji)) {
        // Merge radicals, removing duplicates
        const existingRadicals = merged.get(kanji) || [];
        const combinedRadicals = [
          ...new Set([...existingRadicals, ...radicals]),
        ];
        merged.set(kanji, combinedRadicals);
      } else {
        merged.set(kanji, [...radicals]);
      }
    }
  }

  return merged;
}

async function linkKanjiWithRadicals(
  prismaClient: PrismaClient,
): Promise<number> {
  console.log('Linking kanji with radicals...');

  // File paths for kradfile and kradfile2
  const kradFilePath = path.join(__dirname, 'kradfile.txt');
  const kradFile2Path = path.join(__dirname, 'kradfile2.txt');

  // Parse both files
  const kanjiToRadicals1 = await parseKradFile(kradFilePath);

  let kanjiToRadicals2 = new Map<string, string[]>();
  if (fs.existsSync(kradFile2Path)) {
    kanjiToRadicals2 = await parseKradFile(kradFile2Path);
  }

  // Merge the mappings
  const kanjiToRadicals = mergeKanjiRadicalMappings(
    kanjiToRadicals1,
    kanjiToRadicals2,
  );
  console.log(`Combined mappings contain ${kanjiToRadicals.size} unique kanji`);

  // Create a set of all radicals
  const allRadicals = new Set<string>();
  for (const radicals of kanjiToRadicals.values()) {
    radicals.forEach((r) => allRadicals.add(r));
  }

  console.log(
    `Found ${allRadicals.size} unique radicals in combined kradfiles`,
  );

  // Add radicals to the database if they don't exist
  let radicalsCount = 0;
  const radicalIds = new Map<string, number>();

  for (const radical of allRadicals) {
    // Check if radical already exists
    const existingRadical = await prismaClient.radical.findFirst({
      where: { symbol: radical },
    });

    if (existingRadical) {
      radicalIds.set(radical, existingRadical.id);
    } else {
      // Create new radical
      const newRadical = await prismaClient.radical.create({
        data: {
          symbol: radical,
          name: '',
          nameRomaji: '',
          meaning: `Radical ${radical}`,
        },
      });

      radicalIds.set(radical, newRadical.id);
      radicalsCount++;
    }
  }

  console.log(`Created ${radicalsCount} new radicals`);

  // Link kanji with their radicals
  let linkedKanjiCount = 0;

  // Process in batches to avoid overwhelming the database
  const batchSize = 300;
  const kanjiEntries = Array.from(kanjiToRadicals.entries());

  for (let i = 0; i < kanjiEntries.length; i += batchSize) {
    const batch = kanjiEntries.slice(i, i + batchSize);

    for (const [kanji, radicals] of batch) {
      try {
        // Find the kanji in the database
        const existingKanji = await prismaClient.kanji.findFirst({
          where: { character: kanji },
        });

        if (!existingKanji) {
          // Skip logging for rare kanji to reduce console output
          // console.log(`Kanji ${kanji} not found in database, skipping...`);
          continue;
        }

        // Get radical IDs for this kanji
        const radicalIdsForKanji = radicals
          .map((r) => radicalIds.get(r))
          .filter((id): id is number => id !== undefined);

        // Connect kanji with its radicals
        await prismaClient.kanji.update({
          where: { id: existingKanji.id },
          data: {
            radicals: {
              connect: radicalIdsForKanji.map((id) => ({ id })),
            },
          },
        });

        linkedKanjiCount++;
      } catch (err) {
        console.error(`Error linking kanji ${kanji} with radicals:`, err);
      }
    }

    console.log(
      `Processed ${i + batch.length} out of ${kanjiEntries.length} kanji-radical connections...`,
    );
  }

  console.log(`Linked ${linkedKanjiCount} kanji with their radicals`);
  return linkedKanjiCount;
}

export async function createJapaneseLanguage(prismaClient: PrismaClient) {
  try {
    await ensureBasicDataExists(prismaClient);
    // await importFromKanjidic(prismaClient);
    // await linkKanjiWithRadicals(prismaClient);
    // await seedJMDict(prismaClient);
    // await seedBaseBot(prismaClient);
    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error in data import:', error);
  }
}
