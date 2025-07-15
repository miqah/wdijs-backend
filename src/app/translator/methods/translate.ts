import { NotFoundException } from '@nestjs/common';
import { TranslatorService } from '../translator.service';

export async function translate(
  this: TranslatorService,
  {
    input,
    languageId,
  }: {
    input: string;
    languageId: string;
  },
) {
  //   const language = await this.prismaService.language.findFirst({
  //     where: { id: 1 },
  //   });

  //   if (!language) {
  //     throw new NotFoundException(`Lanuage with id ${languageId} not found`);
  //   }

  if (!input) {
    throw new NotFoundException('Missing input text');
  }
  const translatedText = this.geminiService.translate(input, 'japanese');

  return translatedText;
}
