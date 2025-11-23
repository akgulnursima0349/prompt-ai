import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateJSON } from '@/lib/groq';
import { slugify } from '@prompt-ai/shared';

interface APISetup {
  name: string;
  description: string;
  systemPrompt: string;
  inputSchema: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
  outputSchema: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
  };
  exampleInput: Record<string, unknown>;
  exampleOutput: Record<string, unknown>;
  suggestedEndpoint: string;
}

const SETUP_SYSTEM_PROMPT = `Sen bir AI API tasarimcisisin. Kullanicinin istegine gore bir API yapisi olusturacaksin.

Yanit olarak su formatta bir JSON dondureceksin:
{
  "name": "API'nin kisa ve aciklayici adi (Turkce)",
  "description": "API'nin ne yaptiginin kisa aciklamasi (Turkce)",
  "systemPrompt": "AI modeline verilecek sistem prompt'u (detayli, Turkce veya Ingilizce - ne gerekiyorsa)",
  "inputSchema": {
    "type": "object",
    "properties": {
      "field_name": { "type": "string", "description": "Alan aciklamasi" }
    },
    "required": ["field_name"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "result_field": { "type": "string", "description": "Sonuc aciklamasi" }
    }
  },
  "exampleInput": { "field_name": "ornek deger" },
  "exampleOutput": { "result_field": "ornek sonuc" },
  "suggestedEndpoint": "kebab-case-endpoint-adi"
}

Onemli kurallar:
1. systemPrompt cok detayli ve API'nin ne yapacagini tam aciklayan bir prompt olmali
2. inputSchema ve outputSchema JSON Schema formatinda olmali
3. exampleInput ve exampleOutput gercekci ornekler icermeli
4. suggestedEndpoint URL-dostu (kebab-case) olmali
5. Tum aciklamalar Turkce olmali`;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 });
    }

    const setup = await generateJSON<APISetup>(
      `Kullanici istegi: ${prompt}`,
      SETUP_SYSTEM_PROMPT
    );

    // Ensure suggestedEndpoint is a valid slug
    setup.suggestedEndpoint = slugify(setup.suggestedEndpoint || setup.name);

    return NextResponse.json({ setup });
  } catch (error) {
    console.error('Generate setup error:', error);
    return NextResponse.json(
      { error: 'Setup olusturulurken hata olustu' },
      { status: 500 }
    );
  }
}
