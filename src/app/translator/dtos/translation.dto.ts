// translation.dto.ts
import { IsString, IsObject, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

enum AudioEncoding {
  LINEAR16 = 'LINEAR16',
  AMR_WB = 'AMR_WB',
}

export class AudioConfigDto {
  @IsEnum(AudioEncoding)
  @IsNotEmpty()
  encoding: AudioEncoding;

  @IsNumber()
  @IsNotEmpty()
  sampleRateHertz: number;

  @IsNumber()
  @IsNotEmpty()
  languageId: number;
}

export class TranslationRequestDto {
  @IsString()
  @IsNotEmpty()
  audio: string;

  @IsObject()
  @IsNotEmpty()
  config: AudioConfigDto; 
}