import { Test, TestingModule } from '@nestjs/testing';
import { KanjiBuilderController } from './kanji-builder.controller';

describe('KanjiBuilderController', () => {
  let controller: KanjiBuilderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KanjiBuilderController],
    }).compile();

    controller = module.get<KanjiBuilderController>(KanjiBuilderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
