import { Test, TestingModule } from '@nestjs/testing';
import { VoskService } from './vosk.service';

describe('VoskService', () => {
  let service: VoskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoskService],
    }).compile();

    service = module.get<VoskService>(VoskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
