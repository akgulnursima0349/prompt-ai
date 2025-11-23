import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@prompt-ai/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const api = await prisma.generatedAPI.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        apiKeys: {
          select: { id: true, key: true, name: true, isActive: true },
        },
      },
    });

    if (!api) {
      return NextResponse.json({ error: 'API bulunamadi' }, { status: 404 });
    }

    return NextResponse.json({
      api: {
        id: api.id,
        name: api.name,
        slug: api.slug,
        description: api.description,
        status: api.status,
        inputSchema: JSON.parse(api.inputSchema),
        outputSchema: JSON.parse(api.outputSchema),
        configuration: JSON.parse(api.configuration),
        apiKeys: api.apiKeys,
      },
    });
  } catch (error) {
    console.error('Get API error:', error);
    return NextResponse.json({ error: 'API alinamadi' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const api = await prisma.generatedAPI.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!api) {
      return NextResponse.json({ error: 'API bulunamadi' }, { status: 404 });
    }

    const updated = await prisma.generatedAPI.update({
      where: { id: params.id },
      data: {
        name: body.name || api.name,
        description: body.description || api.description,
        status: body.status || api.status,
        systemPrompt: body.systemPrompt || api.systemPrompt,
        configuration: body.configuration
          ? JSON.stringify(body.configuration)
          : api.configuration,
      },
    });

    return NextResponse.json({ api: updated });
  } catch (error) {
    console.error('Update API error:', error);
    return NextResponse.json({ error: 'API guncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const api = await prisma.generatedAPI.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!api) {
      return NextResponse.json({ error: 'API bulunamadi' }, { status: 404 });
    }

    await prisma.generatedAPI.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json({ error: 'API silinemedi' }, { status: 500 });
  }
}
