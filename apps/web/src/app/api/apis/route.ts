import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@prompt-ai/database';
import { generateAPIKey, slugify } from '@prompt-ai/shared';
import { createHash } from 'crypto';

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apis = await prisma.generatedAPI.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        apiKeys: {
          select: { id: true, name: true, isActive: true },
        },
        _count: {
          select: { usageLogs: true },
        },
      },
    });

    return NextResponse.json({ apis });
  } catch (error) {
    console.error('Get APIs error:', error);
    return NextResponse.json({ error: 'APIs alinamadi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, setup, config } = await request.json();

    // Validate input
    if (!prompt || !setup) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }

    // Generate unique slug
    let slug = slugify(setup.suggestedEndpoint || setup.name);
    const existingApi = await prisma.generatedAPI.findUnique({ where: { slug } });
    if (existingApi) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Generate API key
    const apiKey = generateAPIKey();
    const apiKeyHash = hashApiKey(apiKey);

    // Create API with key
    const api = await prisma.generatedAPI.create({
      data: {
        userId: session.user.id,
        name: setup.name,
        description: setup.description,
        slug,
        userPrompt: prompt,
        systemPrompt: setup.systemPrompt,
        configuration: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: config?.temperature || 0.7,
          maxTokens: config?.maxTokens || 2000,
          rateLimit: {
            requestsPerMinute: 60,
            requestsPerDay: 1000,
          },
          authentication: true,
        }),
        inputSchema: JSON.stringify(setup.inputSchema),
        outputSchema: JSON.stringify(setup.outputSchema),
        status: 'active',
        apiKeys: {
          create: {
            key: apiKey,
            keyHash: apiKeyHash,
            name: 'Default Key',
            isActive: true,
          },
        },
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return NextResponse.json({
      id: api.id,
      apiKey,
      endpoint: `${baseUrl}/api/v1/${slug}`,
    });
  } catch (error) {
    console.error('Create API error:', error);
    return NextResponse.json({ error: 'API olusturulamadi' }, { status: 500 });
  }
}
