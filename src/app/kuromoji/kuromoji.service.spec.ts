import { Test, TestingModule } from '@nestjs/testing';
import { KuromojiService } from './kuromoji.service';

describe('KuromojiService', () => {
  let service: KuromojiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KuromojiService],
    }).compile();

    service = module.get<KuromojiService>(KuromojiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
