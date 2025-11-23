import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@prompt-ai/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import {
  ArrowLeft,
  Code,
  Key,
  BarChart3,
  Clock,
  Copy,
  Play,
  Pause,
  Trash2,
  Settings,
} from 'lucide-react';

async function getApi(id: string, userId: string) {
  return prisma.generatedAPI.findFirst({
    where: { id, userId },
    include: {
      apiKeys: true,
      _count: {
        select: { usageLogs: true },
      },
    },
  });
}

export default async function ApiDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const api = await getApi(params.id, session!.user.id);

  if (!api) {
    notFound();
  }

  const config = JSON.parse(api.configuration);
  const inputSchema = JSON.parse(api.inputSchema);
  const outputSchema = JSON.parse(api.outputSchema);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/apis">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{api.name}</h1>
            <Badge
              variant={
                api.status === 'active'
                  ? 'success'
                  : api.status === 'paused'
                  ? 'warning'
                  : 'secondary'
              }
            >
              {api.status === 'active' ? 'Aktif' : api.status === 'paused' ? 'Duraklatildi' : api.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{api.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/apis/${api.id}/test`}>
            <Button variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Test Et
            </Button>
          </Link>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Duzenle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Istek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{api._count.usageLogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API Anahtari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{api.apiKeys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{config.model}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Son Kullanim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {api.lastUsedAt ? formatRelativeTime(api.lastUsedAt) : 'Henuz kullanilmadi'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Endpoint Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Endpoint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground mb-1">URL</p>
              <code className="font-mono text-sm">
                POST /api/v1/{api.slug}
              </code>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Ornek Istek</p>
              <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto">
{`curl -X POST ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/${api.slug} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(Object.fromEntries(
    Object.keys(inputSchema.properties || {}).map(k => [k, 'value'])
  ), null, 2)}'`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Anahtarlari
            </CardTitle>
            <CardDescription>
              Bu API icin olusturulan anahtarlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {api.apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {key.key.slice(0, 12)}...{key.key.slice(-4)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.isActive ? 'success' : 'secondary'}>
                    {key.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Prompt */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sistem Prompt'u</CardTitle>
            <CardDescription>
              API'nin AI modeline verilen talimatlari
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
              {api.systemPrompt}
            </pre>
          </CardContent>
        </Card>

        {/* Schemas */}
        <Card>
          <CardHeader>
            <CardTitle>Girdi Semasi</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto">
              {JSON.stringify(inputSchema, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cikti Semasi</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto">
              {JSON.stringify(outputSchema, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
