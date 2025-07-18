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

  // A helper to wrap the stream from generateContentStream as async generator yielding text chunks
  private async *streamGenerator(prompt: string): AsyncGenerator<string> {
    const stream = await this.googleAi.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    for await (const chunk of stream) {
      const textChunk = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textChunk) {
        yield textChunk;
      }
    }
  }

  async *translate(text: string, targetLang: string): AsyncGenerator<string> {
    if (!text || text.trim() === '') {
      yield '';
      return;
    }

    const prompt = `
You are a bilingual assistant fluent in English and Japanese. Your task is to:

1. **Translate** the input below into **natural, fluent Japanese**, appropriate for a native speaker.
2. If the input is a **question**, answer it briefly and politely in Japanese.
3. Return **two parts**:
   - 📘 The Japanese text
   - 🔤 The **romaji (pronunciation)** version below it

Use this format exactly:

Japanese: [your Japanese response]
Romaji: [romaji version of that response]

Text to process:
"${text.trim()}"
`.trim();

    yield* this.streamGenerator(prompt);
  }
  // If you want synonyms to stream too, you can do the same
  async *getSynonyms(word: string, lang: string): AsyncGenerator<string> {
    const prompt = `Provide a comma-separated list of synonyms for the word "${word}" in ${lang}.`;
    yield* this.streamGenerator(prompt);
  }
}
