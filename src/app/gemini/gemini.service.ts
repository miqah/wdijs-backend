import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly googleAi: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.googleAi = new GoogleGenAI({ apiKey });
  }

  private async generate(prompt: string): Promise<string> {
    const response = await this.googleAi.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
  }

  async translate(text: string, targetLang: string): Promise<string> {
    const prompt = `Translate the following text into ${targetLang}:\n\n${text}. `;
    return this.generate(prompt);
  }

  async getSynonyms(word: string, lang: string): Promise<string[]> {
    const prompt = `Provide a comma-separated list of synonyms for the word "${word}" in ${lang}.`;
    const raw = await this.generate(prompt);
    return raw
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
  }
}
