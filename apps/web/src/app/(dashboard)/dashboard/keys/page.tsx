import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@prompt-ai/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Copy, Trash2, Plus, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
  usageCount: number;
}

interface ApiWithKeys {
  id: string;
  name: string;
  slug: string;
  apiKeys: ApiKey[];
}

async function getApiKeys(userId: string) {
  const apis = await prisma.generatedAPI.findMany({
    where: { userId },
    include: {
      apiKeys: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return (apis as ApiWithKeys[]).flatMap((api: ApiWithKeys) =>
    api.apiKeys.map((key: ApiKey) => ({
      ...key,
      apiName: api.name,
      apiSlug: api.slug,
      apiId: api.id,
    }))
  );
}

export default async function KeysPage() {
  const session = await getServerSession(authOptions);
  const keys = await getApiKeys(session!.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Anahtarlari</h1>
          <p className="text-muted-foreground">
            Tum API anahtarlarinizi yonetin
          </p>
        </div>
      </div>

      {/* Keys List */}
      {keys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <Key className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Henuz anahtar yok</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Bir API olusturdugunuzda otomatik olarak anahtar olusturulur.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{key.name}</span>
                    <Badge variant={key.isActive ? 'success' : 'secondary'}>
                      {key.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>API: {key.apiName}</span>
                    <span>|</span>
                    <code className="bg-muted px-2 py-0.5 rounded">
                      {key.key.slice(0, 12)}...{key.key.slice(-4)}
                    </code>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Olusturuldu: {formatRelativeTime(key.createdAt)}
                    </span>
                    {key.lastUsedAt && (
                      <span>Son kullanim: {formatRelativeTime(key.lastUsedAt)}</span>
                    )}
                    <span>{key.usageCount} kullanim</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" title="Kopyala">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" title="Sil">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="border-brand-200 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-950/30">
        <CardHeader>
          <CardTitle className="text-lg">API Anahtari Guvenligi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            API anahtarlarinizi guvenli bir sekilde saklayin ve asla herkese acik yerlerde paylasmayin.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Anahtarlari environment variable olarak saklayin</li>
            <li>Git repository'lerine commit etmeyin</li>
            <li>Duzenli olarak anahtarlarinizi yenileyin</li>
            <li>Kullanilmayan anahtarlari silin veya devre disi birakin</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
