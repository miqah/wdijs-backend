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

  async *getBotIntroduction({
    targetLang,
    userContext,
    baseContext,
  }: {
    targetLang: string;
    userContext?: string;
    baseContext?: string;
  }): AsyncGenerator<string> {
    const introPrompt = `
${baseContext}

${userContext}

Please write a short, friendly introduction in ${targetLang} from the AI bot to a new user.
The tone should be warm and welcoming.

Important:
- Reply only in ${targetLang}
- Do not include any labels, markdown, or JSON
- Just return plain natural text
    `.trim();

    yield* this.streamGenerator(introPrompt);
  }

  async *getSynonyms(word: string, lang: string): AsyncGenerator<string> {
    const prompt = `
Give a comma-separated list of synonyms for the word "${word}" in ${lang}.

Important:
- Do not include labels like "Synonyms:"
- No JSON or markdown
- Just return the plain list
    `.trim();

    yield* this.streamGenerator(prompt);
  }

  async *translateWithContext({
    text,
    targetLang,
    userContext,
    baseContext,
  }: {
    text: string;
    targetLang: string;
    userContext?: string;
    baseContext?: string;
  }): AsyncGenerator<string> {
    if (!text?.trim()) {
      yield '';
      return;
    }

    const finalPrompt = `
${baseContext}

${userContext}

Please respond to the user's message in fluent, natural ${targetLang}.
Then continue the conversation with a friendly, casual follow-up.

User message: "${text}"

Important:
- Only reply in ${targetLang}
- Do not include any labels like "Reply:" or "Options:"
- Do not use JSON or special formatting
- Do not explain the answer
- Just return a natural conversational reply
    `.trim();

    yield* this.streamGenerator(finalPrompt);
  }

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
}
