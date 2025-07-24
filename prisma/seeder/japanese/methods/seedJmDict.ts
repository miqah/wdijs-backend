import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { parseStringPromise } from 'xml2js';

export async function seedJMDict(prismaClient: PrismaClient) {
  const xmlData = fs.readFileSync(filePath, 'utf8');
  const result = await parseStringPromise(xmlData);

  const entries = result.JMdict.entry;

  const language = await prismaClient.language.findFirst({
    where: { name: 'Japanese' },
  });
  const level = await prismaClient.testLevel.findFirst({
    where: { name: 'N5' },
  }); // Replace with dynamic logic if needed

  if (!language || !level) {
    throw new Error('Missing required language or test level');
  }

  for (const entry of entries) {
    const kebs = entry.k_ele?.map((k) => k.keb?.[0]).filter(Boolean) || [];
    const rebs = entry.r_ele?.map((r) => r.reb?.[0]).filter(Boolean) || [];

    const senses = (entry.sense || []).map((sense) => {
      const pos = sense.pos?.[0]?.replace(/&[^;]+;/g, '') || 'n';
      const glosses = (sense.gloss || [])
        .map((g) => (typeof g === 'string' ? g : g._))
        .filter(Boolean);
      return { partOfSpeech: pos, glosses };
    });

    const wordTypeRaw = senses[0]?.partOfSpeech?.toLowerCase() || 'n';
    const wordType = mapJMdictPosToEnum(wordTypeRaw);

    try {
      await prismaClient.word.create({
        data: {
          type: wordType,
          language: { connect: { id: language.id } },
          testLevel: { connect: { id: level.id } },
          writings: {
            create: kebs.map((k) => ({ text: k, isKana: false })),
          },
          readings: {
            create: rebs.map((r) => ({ value: r })),
          },
          senses: {
            create: senses.map((sense) => ({
              partOfSpeech: mapJMdictPosToEnum(sense.partOfSpeech),
              glosses: {
                create: sense.glosses.map((text) => ({ text })),
              },
            })),
          },
        },
      });

      console.log(`✅ Seeded word: ${kebs[0] || rebs[0]}`);
    } catch (err) {
      console.error(
        `❌ Failed to seed word: ${kebs[0] || rebs[0]}`,
        err.message,
      );
    }
  }
}

function mapJMdictPosToEnum(pos: string): any {
  const posMap: Record<string, string> = {
    n: 'N',
    pn: 'PN',
    adj_i: 'ADJ_I',
    adj_na: 'ADJ_NA',
    adv: 'ADV',
    v1: 'V1',
    v5u: 'V5U',
    vs: 'VS',
    conj: 'CONJ',
    interj: 'INTERJ',
    pron: 'PRON',
    suf: 'SUFFIX',
    pref: 'PREFIX',
    exp: 'EXP',
  };
  return posMap[pos.toLowerCase()] || 'N';
}
