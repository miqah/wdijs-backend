import { WordType } from '@prisma/client';
import { IpadicFeatures } from 'kuromoji';

/**
 * Maps Kuromoji part-of-speech tags to your database WordType enum
 * @param token The token from Kuromoji tokenizer
 * @returns The corresponding WordType or null if no direct mapping exists
 */
export function mapKuromojiPosToWordType(
  token: IpadicFeatures,
): WordType | null {
  // Kuromoji provides POS info in these fields:
  // - pos: Main part of speech (e.g. "名詞" (noun), "動詞" (verb))
  // - pos_detail_1: Sub classification 1
  // - pos_detail_2: Sub classification 2
  // - pos_detail_3: Sub classification 3
  // - conjugated_type: Conjugation type for verbs

  const pos = token.pos;
  const posDetail1 = token.pos_detail_1;
  const posDetail2 = token.pos_detail_2;
  const posDetail3 = token.pos_detail_3;
  const conjugatedType = token.conjugated_type;

  // Handle nouns
  if (pos === '名詞') {
    if (posDetail1 === '副詞可能') return 'N_ADV';
    if (posDetail1 === '時相名詞' || posDetail1 === '時間') return 'N_T';
    if (posDetail1 === '接頭詞的' || posDetail1 === '接頭') return 'N_PREF';
    if (posDetail1 === '接尾' || posDetail1 === '接尾辞的') return 'N_SUF';
    // Default to common noun
    return 'N';
  }

  // Handle pronouns
  if (pos === '代名詞') return 'PN';

  // Handle verbs
  if (pos === '動詞') {
    if (conjugatedType === '一段') return 'V1';
    if (conjugatedType === '五段・バ行') return 'V5B';
    if (conjugatedType === '五段・ガ行') return 'V5G';
    if (conjugatedType === '五段・カ行') return 'V5K';
    if (conjugatedType === '五段・マ行') return 'V5M';
    if (conjugatedType === '五段・ナ行') return 'V5N';
    if (conjugatedType === '五段・ラ行') return 'V5R';
    if (conjugatedType === '五段・サ行') return 'V5S';
    if (conjugatedType === '五段・タ行') return 'V5T';
    if (conjugatedType === '五段・ワ行') return 'V5U';
    if (
      conjugatedType === '五段・カ行促音便' &&
      (token.basic_form === '行く' || token.basic_form === '逝く')
    )
      return 'V5K_S';
    if (conjugatedType === 'サ変・スル') return 'VS';
    if (conjugatedType === 'サ変・−スル') return 'VS';
    if (conjugatedType === 'サ変・−ズル') return 'VZ';
    if (conjugatedType === 'カ変・来ル') return 'VK';
    // For transitive/intransitive, we need to check against a dictionary
    // as this information isn't directly provided by Kuromoji
  }

  // Handle adjectives
  if (pos === '形容詞') {
    if (conjugatedType === '形容詞・イ段') return 'ADJ_I';
    // Others may need additional checks
  }

  if (pos === '形容動詞') return 'ADJ_NA';

  // Handle adverbs
  if (pos === '副詞') {
    if (posDetail1 === 'と') return 'ADV_TO';
    return 'ADV';
  }

  // Handle conjunctions
  if (pos === '接続詞') return 'CONJ';

  // Handle particles
  if (pos === '助詞') return 'PRT';

  // Handle auxiliary verbs
  if (pos === '助動詞') return 'AUX_V';

  // Handle interjections
  if (pos === '感動詞') return 'INT';

  // Handle prefixes and suffixes
  if (pos === '接頭詞') return 'PREF';
  if (pos === '接尾辞') return 'SUFFIX';

  // If no direct mapping, return null or a default value
  return null;
}
