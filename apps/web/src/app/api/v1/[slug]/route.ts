import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@prompt-ai/database';
import { chat, MODELS } from '@/lib/groq';
import { createHash } from 'crypto';

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

function extractApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return request.headers.get('x-api-key');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const startTime = Date.now();
  let api: Awaited<ReturnType<typeof prisma.generatedAPI.findUnique>> | null = null;
  let apiKeyRecord: Awaited<ReturnType<typeof prisma.aPIKey.findFirst>> | null = null;

  try {
    const { slug } = params;

    // Find API by slug
    api = await prisma.generatedAPI.findUnique({
      where: { slug },
      include: { user: { select: { id: true } } },
    });

    if (!api) {
      return NextResponse.json(
        { error: 'API bulunamadi', code: 'API_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (api.status !== 'active') {
      return NextResponse.json(
        { error: 'API aktif degil', code: 'API_INACTIVE' },
        { status: 403 }
      );
    }

    // Validate API key
    const apiKey = extractApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API anahtari gerekli', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const keyHash = hashApiKey(apiKey);
    apiKeyRecord = await prisma.aPIKey.findFirst({
      where: {
        apiId: api.id,
        keyHash,
        isActive: true,
      },
    });

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: 'Gecersiz API anahtari', code: 'INVALID_API_KEY' },
        { status: 401 }
      );
    }

    // Check expiration
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'API anahtari suresi dolmus', code: 'API_KEY_EXPIRED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const inputSchema = JSON.parse(api.inputSchema);

    // Basic input validation
    if (inputSchema.required) {
      for (const field of inputSchema.required) {
        if (body[field] === undefined) {
          return NextResponse.json(
            { error: `Zorunlu alan eksik: ${field}`, code: 'INVALID_INPUT' },
            { status: 400 }
          );
        }
      }
    }

    // Parse configuration
    const config = JSON.parse(api.configuration);

    // Build the user message from input
    const userMessage = JSON.stringify(body, null, 2);

    // Call AI model
    const response = await chat(
      [
        { role: 'system', content: api.systemPrompt },
        { role: 'user', content: userMessage },
      ],
      {
        model: config.model || MODELS.LLAMA_70B,
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 2000,
      }
    );

    // Try to parse response as JSON
    let output: unknown;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        output = JSON.parse(jsonMatch[0]);
      } else {
        output = { response: response };
      }
    } catch {
      output = { response: response };
    }

    const latency = Date.now() - startTime;

    // Update usage stats
    await Promise.all([
      prisma.generatedAPI.update({
        where: { id: api.id },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      }),
      prisma.aPIKey.update({
        where: { id: apiKeyRecord.id },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      }),
      prisma.usageLog.create({
        data: {
          apiId: api.id,
          apiKeyId: apiKeyRecord.id,
          userId: api.userId,
          requestBody: JSON.stringify(body),
          responseBody: JSON.stringify(output),
          statusCode: 200,
          latencyMs: latency,
        },
      }),
    ]);

    return NextResponse.json(output, {
      headers: {
        'X-Request-Id': `req_${Date.now().toString(36)}`,
        'X-Latency-Ms': latency.toString(),
      },
    });
  } catch (error) {
    console.error('API execution error:', error);

    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';

    // Log error
    if (api && apiKeyRecord) {
      await prisma.usageLog.create({
        data: {
          apiId: api.id,
          apiKeyId: apiKeyRecord.id,
          userId: api.userId,
          statusCode: 500,
          latencyMs: latency,
          errorMessage,
        },
      });
    }

    return NextResponse.json(
      { error: 'API istegi basarisiz', code: 'INTERNAL_ERROR', message: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint for API info
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const api = await prisma.generatedAPI.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        inputSchema: true,
        outputSchema: true,
        status: true,
      },
    });

    if (!api) {
      return NextResponse.json({ error: 'API bulunamadi' }, { status: 404 });
    }

    return NextResponse.json({
      name: api.name,
      description: api.description,
      status: api.status,
      inputSchema: JSON.parse(api.inputSchema),
      outputSchema: JSON.parse(api.outputSchema),
    });
  } catch (error) {
    console.error('Get API info error:', error);
    return NextResponse.json({ error: 'API bilgisi alinamadi' }, { status: 500 });
  }
}
