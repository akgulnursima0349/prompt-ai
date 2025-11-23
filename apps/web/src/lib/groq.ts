import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY environment variable is required');
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const MODELS = {
  LLAMA_70B: 'llama-3.3-70b-versatile',
  LLAMA_8B: 'llama-3.1-8b-instant',
  MIXTRAL: 'mixtral-8x7b-32768',
  LLAMA_90B: 'llama-3.2-90b-vision-preview',
} as const;

export type ModelType = typeof MODELS[keyof typeof MODELS];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: ModelType;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const {
    model = MODELS.LLAMA_70B,
    temperature = 0.7,
    maxTokens = 4000,
  } = options;

  const response = await groq.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content || '';
}

export async function generateJSON<T>(
  prompt: string,
  systemPrompt: string,
  options: ChatOptions = {}
): Promise<T> {
  const response = await chat(
    [
      { role: 'system', content: systemPrompt + '\n\nYANITINI SADECE VALID JSON OLARAK VER. BASKA HICBIR SEY YAZMA.' },
      { role: 'user', content: prompt },
    ],
    { ...options, temperature: 0.3 }
  );

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from response');
  }

  return JSON.parse(jsonMatch[0]) as T;
}
