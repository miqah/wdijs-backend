import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getRadicals } from './methods/getRadicals';

@Injectable()
export class KanjiBuilderService {
  constructor(protected readonly prismaService: PrismaService) {}

  getRadicals = getRadicals;
}
