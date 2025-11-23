'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Loader2, Clock, Copy, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface APIInfo {
  id: string;
  name: string;
  slug: string;
  inputSchema: {
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
  apiKeys: { key: string }[];
}

interface TestResult {
  success: boolean;
  output?: unknown;
  error?: string;
  latency: number;
}

export default function ApiTestPage() {
  const params = useParams();
  const [api, setApi] = useState<APIInfo | null>(null);
  const [input, setInput] = useState('{}');
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function fetchApi() {
      try {
        const response = await fetch(`/api/apis/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setApi(data.api);

          // Set default input based on schema
          if (data.api.inputSchema?.properties) {
            const defaultInput: Record<string, string> = {};
            Object.keys(data.api.inputSchema.properties).forEach((key) => {
              defaultInput[key] = '';
            });
            setInput(JSON.stringify(defaultInput, null, 2));
          }
        }
      } catch (error) {
        toast.error('API bilgisi alinamadi');
      } finally {
        setIsFetching(false);
      }
    }
    fetchApi();
  }, [params.id]);

  const handleTest = async () => {
    if (!api) return;

    setIsLoading(true);
    setResult(null);

    const startTime = Date.now();

    try {
      let parsedInput;
      try {
        parsedInput = JSON.parse(input);
      } catch {
        throw new Error('Gecersiz JSON formati');
      }

      const response = await fetch(`/api/v1/${api.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.apiKeys[0]?.key}`,
        },
        body: JSON.stringify(parsedInput),
      });

      const latency = Date.now() - startTime;
      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          output: data,
          latency,
        });
        toast.success('Test basarili!');
      } else {
        setResult({
          success: false,
          error: data.error || 'Bilinmeyen hata',
          latency,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test sirasinda hata olustu',
        latency: Date.now() - startTime,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandi!');
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!api) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">API bulunamadi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/apis/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">API Test - {api.name}</h1>
          <p className="text-muted-foreground">API'nizi canli olarak test edin</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Istek</CardTitle>
            <CardDescription>
              Test icin JSON formatinda girdi girin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Schema Info */}
            {api.inputSchema?.properties && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs font-medium mb-2">Beklenen Alanlar:</p>
                <div className="space-y-1">
                  {Object.entries(api.inputSchema.properties).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <code className="bg-background px-1 rounded">{key}</code>
                      <span className="text-muted-foreground">({value.type})</span>
                      {api.inputSchema.required?.includes(key) && (
                        <Badge variant="outline" className="text-[10px] h-4">
                          Zorunlu
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder='{"key": "value"}'
            />

            <Button
              variant="gradient"
              className="w-full"
              onClick={handleTest}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Test Ediliyor...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Testi Calistir
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle>Yanit</CardTitle>
            <CardDescription>
              API'den donen sonuc
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <Badge variant="success">Basarili</Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <Badge variant="destructive">Hata</Badge>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {result.latency}ms
                  </div>
                </div>

                {/* Response */}
                <div className="relative">
                  <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto min-h-[250px] max-h-[400px] overflow-y-auto">
                    {result.success
                      ? JSON.stringify(result.output, null, 2)
                      : result.error}
                  </pre>
                  {result.success && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        copyToClipboard(JSON.stringify(result.output, null, 2))
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Play className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Sonuclari gormek icin testi calistirin
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
