import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@promptai.com' },
    update: {},
    create: {
      email: 'demo@promptai.com',
      name: 'Demo User',
      plan: 'starter',
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create sample API
  const sampleApiKey = 'pak_demo123456789012345678901234';

  const sampleApi = await prisma.generatedAPI.upsert({
    where: { slug: 'sentiment-analyzer' },
    update: {},
    create: {
      userId: demoUser.id,
      name: 'Sentiment Analyzer',
      description: 'Analyzes the sentiment of given text and returns positive, negative, or neutral classification.',
      slug: 'sentiment-analyzer',
      userPrompt: 'Create an API that analyzes the sentiment of text and tells me if it is positive, negative, or neutral',
      systemPrompt: `You are a sentiment analysis assistant. Analyze the given text and determine its sentiment.

Respond with a JSON object containing:
- sentiment: "positive", "negative", or "neutral"
- confidence: a number between 0 and 1
- explanation: a brief explanation of why you classified it this way`,
      configuration: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        temperature: 0.3,
        maxTokens: 500,
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerDay: 1000,
        },
        authentication: true,
      }),
      inputSchema: JSON.stringify({
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text to analyze for sentiment',
          },
        },
        required: ['text'],
      }),
      outputSchema: JSON.stringify({
        type: 'object',
        properties: {
          sentiment: {
            type: 'string',
            enum: ['positive', 'negative', 'neutral'],
          },
          confidence: {
            type: 'number',
          },
          explanation: {
            type: 'string',
          },
        },
      }),
      status: 'active',
      apiKeys: {
        create: {
          key: sampleApiKey,
          keyHash: hashApiKey(sampleApiKey),
          name: 'Demo API Key',
          isActive: true,
        },
      },
    },
  });

  console.log('✅ Created sample API:', sampleApi.name);
  console.log('   API Key:', sampleApiKey);

  console.log('');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
