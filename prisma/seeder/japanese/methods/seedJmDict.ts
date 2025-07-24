import { PrismaClient, WordType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

// Define path to your existing file
const JMDICT_PATH = path.resolve(__dirname, '../data/JMdict_e');

// Enhanced function to check commonness and return a priority score
function getWordPriority(entry: any): {
  isCommon: boolean;
  priority: number | null;
} {
  // Check for priority markers in kanji elements
  const kebPriorities: string[] = [];

  // Handle k_ele differently with fast-xml-parser output
  if (entry.k_ele) {
    const kEleArray = Array.isArray(entry.k_ele) ? entry.k_ele : [entry.k_ele];
    for (const k of kEleArray) {
      if (k.ke_pri) {
        const kePriArray = Array.isArray(k.ke_pri) ? k.ke_pri : [k.ke_pri];
        kebPriorities.push(...kePriArray);
      }
    }
  }

  // Check for priority markers in reading elements
  const rebPriorities: string[] = [];

  // Handle r_ele differently with fast-xml-parser output
  if (entry.r_ele) {
    const rEleArray = Array.isArray(entry.r_ele) ? entry.r_ele : [entry.r_ele];
    for (const r of rEleArray) {
      if (r.re_pri) {
        const rePriArray = Array.isArray(r.re_pri) ? r.re_pri : [r.re_pri];
        rebPriorities.push(...rePriArray);
      }
    }
  }

  // Combine all priority markers
  const allPriorities = [...kebPriorities, ...rebPriorities];

  // Words with these markers are definitely common
  const commonMarkers = ['news1', 'ichi1', 'spec1', 'gai1'];
  const isCommon = allPriorities.some(
    (pri) =>
      typeof pri === 'string' &&
      commonMarkers.some((marker) => pri.includes(marker)),
  );

  // Calculate a numeric priority (lower = more common)
  let priority: number | null = null;

  // Check for nf (word frequency) markers
  const nfMarkers = allPriorities.filter(
    (pri) => typeof pri === 'string' && pri.startsWith('nf'),
  );

  if (nfMarkers.length > 0) {
    // Extract the numeric part (e.g., 'nf01' -> 1, 'nf27' -> 27)
    const frequencies = nfMarkers.map((nf) => {
      const match = nf.match(/nf(\d+)/);
      return match ? parseInt(match[1], 10) : 999;
    });
    // Use the lowest frequency number
    priority = Math.min(...frequencies);
  } else if (isCommon) {
    // If no nf marker but has other common markers, give it priority 20
    // (common words without frequency data)
    priority = 20;
  }

  return { isCommon, priority };
}

function mapJMdictPosToEnum(pos: string): WordType {
  // Clean up the input POS tag (remove XML entities)
  const cleanPos = pos.toLowerCase().replace(/&([a-z0-9]+);/gi, '$1');

  const posMap: Record<string, WordType> = {
    // Basic parts of speech
    n: 'N',
    pn: 'PN',
    'n-adv': 'N_ADV',
    'adj-i': 'ADJ_I',
    'adj-na': 'ADJ_NA',
    adv: 'ADV',
    v1: 'V1',
    v5u: 'V5U',
    vs: 'VS',
    conj: 'CONJ',
    interj: 'INTERJ',
    pron: 'PN',
    suf: 'SUFFIX',
    pref: 'PREF',
    exp: 'EXP',

    // Map other common POS tags to the closest match in your enum
    'n-t': 'N_T',
    'n-pref': 'N_PREF',
    'n-suf': 'N_SUF',
    v5b: 'V5B',
    v5g: 'V5G',
    v5k: 'V5K',
    v5m: 'V5M',
    v5n: 'V5N',
    v5r: 'V5R',
    v5s: 'V5S',
    v5t: 'V5T',
    'v5k-s': 'V5K_S',
    'vs-s': 'VS_S',
    'vs-i': 'VS_I',
    vk: 'VK',
    vz: 'VZ',
    vi: 'VI',
    vt: 'VT',
    'adj-no': 'ADJ_NO',
    'adj-pn': 'ADJ_PN',
    'adj-t': 'ADJ_T',
    'adj-f': 'ADJ_F',
    'adv-to': 'ADV_TO',
    aux: 'AUX',
    'aux-v': 'AUX_V',
    'aux-adj': 'AUX_ADJ',
    ctr: 'CTR',
    int: 'INT',
    prt: 'PRT',
    prov: 'PROV',
  };

  // Return the mapped type or default to N (noun)
  return posMap[cleanPos] || 'N';
}

export async function seedJMDict(prismaClient: PrismaClient) {
  console.log('Starting JMdict seeding...');

  // Check if file exists
  if (!fs.existsSync(JMDICT_PATH)) {
    throw new Error(
      `JMdict file not found at ${JMDICT_PATH}. Please ensure the file exists.`,
    );
  }

  console.log('Reading JMdict file from', JMDICT_PATH);
  const xmlData = fs.readFileSync(JMDICT_PATH, 'utf8');
  console.log('Parsing XML...');

  // Use fast-xml-parser with tolerant options
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    allowBooleanAttributes: true,
    trimValues: true,
    processEntities: false, // Don't strictly process entities
    parseTagValue: true,
    isArray: (name) =>
      [
        'entry',
        'k_ele',
        'r_ele',
        'sense',
        'pos',
        'gloss',
        'keb',
        'reb',
        'ke_pri',
        're_pri',
      ].includes(name),
  });

  try {
    const result = parser.parse(xmlData);
    const entries = result.JMdict.entry;
    console.log(`Found ${entries.length} entries in JMdict.`);

    const language = await prismaClient.language.findFirst({
      where: { name: 'Japanese' },
    });

    if (!language) {
      throw new Error(
        'Missing required Japanese language entry. Run basic seeder first.',
      );
    }

    // Pre-fetch all kanji to allow connections
    console.log('Loading kanji characters from database...');
    const allKanji = await prismaClient.kanji.findMany({
      select: { id: true, character: true },
    });

    // Create a map for faster kanji lookup
    const kanjiMap = new Map(allKanji.map((k) => [k.character, k.id]));
    console.log(
      `Loaded ${kanjiMap.size} kanji characters for connecting to words.`,
    );

    // Pre-fetch existing entries to avoid duplicates
    console.log('Checking for existing dictionary entries...');
    const existingEntries = await prismaClient.word.findMany({
      where: {
        languageId: language.id,
        entSeq: { not: null },
      },
      select: { entSeq: true },
    });

    // Create a Set of existing entry sequences for faster lookup
    const existingEntrySeqs = new Set(existingEntries.map((e) => e.entSeq));
    console.log(
      `Found ${existingEntrySeqs.size} existing entries that will be skipped.`,
    );

    // Set to track missing kanji
    const missingKanji = new Set<string>();

    let processed = 0;
    let skipped = 0;
    let succeeded = 0;
    let failed = 0;
    const BATCH_SIZE = 100; // Process in batches for better performance

    // Process in batches
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batchEntries = entries.slice(i, i + BATCH_SIZE);
      const batchPromises: Promise<void>[] = [];

      for (const entry of batchEntries) {
        processed++;

        // Get entry sequence for reference
        const entSeq = Array.isArray(entry.ent_seq)
          ? entry.ent_seq[0]
          : entry.ent_seq;

        // Skip if this entry already exists in the database
        if (existingEntrySeqs.has(entSeq)) {
          skipped++;
          if (processed % 1000 === 0 || processed === entries.length) {
            const percent = Math.round((processed / entries.length) * 100);
            console.log(
              `Progress: ${processed}/${entries.length} entries (${percent}%) - ${succeeded} succeeded, ${failed} failed, ${skipped} skipped`,
            );
          }
          continue;
        }

        // Extract writings (kanji)
        const kebs: string[] = [];
        if (entry.k_ele) {
          const kElements = Array.isArray(entry.k_ele)
            ? entry.k_ele
            : [entry.k_ele];
          for (const k of kElements) {
            if (k.keb) {
              const kebValues = Array.isArray(k.keb) ? k.keb : [k.keb];
              kebs.push(...kebValues);
            }
          }
        }

        // Extract readings (kana)
        const rebs: string[] = [];
        if (entry.r_ele) {
          const rElements = Array.isArray(entry.r_ele)
            ? entry.r_ele
            : [entry.r_ele];
          for (const r of rElements) {
            if (r.reb) {
              const rebValues = Array.isArray(r.reb) ? r.reb : [r.reb];
              rebs.push(...rebValues);
            }
          }
        }

        // Skip entries with no writings or readings
        if (kebs.length === 0 && rebs.length === 0) {
          continue;
        }

        // Process senses and extract English glosses
        const senses: { partOfSpeech: string; glosses: string[] }[] = [];

        if (entry.sense) {
          const senseElements = Array.isArray(entry.sense)
            ? entry.sense
            : [entry.sense];

          for (const sense of senseElements) {
            // Extract part of speech, defaulting to noun if not specified
            let pos = 'n';
            if (sense.pos) {
              const posValues = Array.isArray(sense.pos)
                ? sense.pos
                : [sense.pos];
              if (posValues.length > 0) {
                const posValue = String(posValues[0]);

                // Extract the content between & and ;
                const match = posValue.match(/&([^;]+);/);
                if (match && match[1]) {
                  pos = match[1]; // This correctly extracts just the part between & and ;
                } else if (posValue.trim()) {
                  pos = posValue; // Use the original value if no entity format
                }
              }
            }

            // Extract glosses
            const glosses: string[] = [];
            if (sense.gloss) {
              const glossValues = Array.isArray(sense.gloss)
                ? sense.gloss
                : [sense.gloss];
              for (const gloss of glossValues) {
                let glossText = '';
                if (typeof gloss === 'string') {
                  glossText = gloss;
                } else if (gloss && typeof gloss === 'object') {
                  // Handle cases where gloss might be an object with text content
                  glossText = gloss['#text'] || gloss._ || String(gloss);
                }
                if (glossText) {
                  glosses.push(glossText);
                }
              }
            }

            senses.push({ partOfSpeech: pos, glosses });
          }
        }

        // Skip entries with no glosses
        if (senses.every((sense) => sense.glosses.length === 0)) {
          continue;
        }

        // Get commonness and priority information
        const { isCommon, priority } = getWordPriority(entry);

        // Extract all kanji characters from the writings
        const kanjiCharacters = new Set<string>();
        for (const keb of kebs) {
          // Extract each kanji character from the writing
          for (const char of keb) {
            // Check if it's a kanji character (CJK Unified Ideographs range)
            if (/[\u4e00-\u9faf]/.test(char)) {
              kanjiCharacters.add(char);
            }
          }
        }

        // Find kanji IDs for the extracted characters
        const kanjiIds: number[] = [];
        kanjiCharacters.forEach((char) => {
          const kanjiId = kanjiMap.get(char);
          if (kanjiId) {
            kanjiIds.push(kanjiId);
          } else {
            // Track missing kanji
            missingKanji.add(char);
          }
        });

        const createPromise = prismaClient.word
          .create({
            data: {
              languageId: language.id,
              entSeq: entSeq,
              isCommon: isCommon,
              priority: priority,
              writings: {
                create: kebs.map((k) => ({
                  text: k,
                  isKana: !/[\u4e00-\u9faf]/.test(k),
                })),
              },
              readings: {
                create: rebs.map((r) => ({ value: r })),
              },
              senses: {
                create: senses.map((sense) => ({
                  partOfSpeech: mapJMdictPosToEnum(sense.partOfSpeech),
                  originalPosTag: sense.partOfSpeech,
                  englishGlosses: {
                    create: sense.glosses.map((text) => ({ text })),
                  },
                })),
              },
            },
          })
          .then(async (createdWord) => {
            // For each writing that contains kanji, create kanji_in_writing entries
            for (const keb of kebs) {
              if (/[\u4e00-\u9faf]/.test(keb)) {
                // Only process writings with kanji
                // Get the writing record we just created
                const writing = await prismaClient.wordWriting.findFirst({
                  where: {
                    wordId: createdWord.id,
                    text: keb,
                  },
                });

                if (writing) {
                  // Create all kanji connections for this writing
                  for (let position = 0; position < keb.length; position++) {
                    const char = keb[position];

                    // Only process if it's a kanji character
                    if (/[\u4e00-\u9faf]/.test(char)) {
                      const kanjiId = kanjiMap.get(char);

                      if (kanjiId) {
                        // Create each kanji connection individually
                        try {
                          await prismaClient.kanjiInWriting.create({
                            data: {
                              writingId: writing.id,
                              kanjiId: kanjiId,
                              position: position,
                            },
                          });
                        } catch (err) {
                          console.error(
                            `Failed to create kanji connection for ${char} in ${keb}:`,
                            err.message,
                          );
                        }
                      }
                    }
                  }
                }
              }
            }

            succeeded++;
            if (processed % 1000 === 0 || processed === entries.length) {
              const percent = Math.round((processed / entries.length) * 100);
              console.log(
                `Progress: ${processed}/${entries.length} entries (${percent}%) - ${succeeded} succeeded, ${failed} failed, ${skipped} skipped`,
              );
            }
          })
          .catch((err) => {
            failed++;
            console.error(
              `❌ Failed to seed word: ${kebs[0] || rebs[0]} (entry ${entSeq})`,
              err.message,
            );
          });

        batchPromises.push(createPromise);
      }

      // Wait for all promises in this batch to complete before continuing
      await Promise.all(batchPromises);

      // Log batch completion
      console.log(
        `Completed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(entries.length / BATCH_SIZE)}`,
      );
    }

    // Log missing kanji statistics
    if (missingKanji.size > 0) {
      console.log(
        `\n📊 Found ${missingKanji.size} kanji in JMdict that are not in your database:`,
      );

      // Write missing kanji to a file
      const missingKanjiPath = path.join(
        __dirname,
        '../data/missing_kanji.txt',
      );
      fs.writeFileSync(missingKanjiPath, Array.from(missingKanji).join('\n'));

      console.log(`📝 Wrote missing kanji to: ${missingKanjiPath}`);

      // Show a sample of missing kanji in the console
      const sampleSize = Math.min(20, missingKanji.size);
      const sample = Array.from(missingKanji).slice(0, sampleSize);
      console.log(`Sample of missing kanji: ${sample.join(' ')}`);
    } else {
      console.log(
        `\n✅ All kanji in JMdict were found in your database. Great!`,
      );
    }

    console.log(
      `\n✅ JMdict seeding complete. Processed ${processed} entries (${succeeded} succeeded, ${failed} failed, ${skipped} skipped)`,
    );
  } catch (error) {
    console.error('Error parsing XML or processing data:', error);
    throw error;
  }
}
