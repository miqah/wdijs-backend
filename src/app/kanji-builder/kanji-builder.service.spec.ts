import { Test, TestingModule } from '@nestjs/testing';
import { KanjiBuilderService } from './kanji-builder.service';

describe('KanjiBuilderService', () => {
  let service: KanjiBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KanjiBuilderService],
    }).compile();

    service = module.get<KanjiBuilderService>(KanjiBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
