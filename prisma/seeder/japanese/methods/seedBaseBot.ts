import { PrismaClient } from '@prisma/client';

export async function seedBaseBot(prisma: PrismaClient) {
  try {
    const existing = await prisma.bot.findFirst({
      where: { name: 'Greeting Bot' },
    });

    if (existing) {
      console.log('Base Greeting Bot already exists');
      return existing;
    }

    const baseBot = await prisma.bot.create({
      data: {
        name: 'Greeting Bot',
        description: 'Helps users start basic conversations and greetings.',
        basePrompt: `
You are a friendly Japanese conversation partner. Start with simple greetings, then escalate slowly into common introductory topics (e.g. name, where you're from). Respond clearly and slowly for beginners.
        `.trim(),
      },
    });

    console.log('✅ Base Greeting Bot created');
    return baseBot;
  } catch (error) {
    console.error('❌ Error seeding base bot:', error);
    throw error;
  }
}
