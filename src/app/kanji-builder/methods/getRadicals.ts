import { KanjiBuilderService } from '../kanji-builder.service';

export function getRadicals(this: KanjiBuilderService) {
  return this.prismaService.radical.findMany({});
}
