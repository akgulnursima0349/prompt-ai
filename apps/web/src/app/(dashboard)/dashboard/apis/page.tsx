import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@prompt-ai/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Code, MoreVertical, Copy, Trash2, Pause, Play } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

async function getApis(userId: string) {
  return prisma.generatedAPI.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      apiKeys: {
        select: { id: true, key: true },
        take: 1,
      },
      _count: {
        select: { usageLogs: true },
      },
    },
  });
}

export default async function ApisPage() {
  const session = await getServerSession(authOptions);
  const apis = await getApis(session!.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API'lerim</h1>
          <p className="text-muted-foreground">
            Olusturdugunuz tum API'leri yonetin
          </p>
        </div>
        <Link href="/dashboard/apis/new">
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            Yeni API
          </Button>
        </Link>
      </div>

      {/* API List */}
      {apis.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <Code className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Henuz API yok</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Ilk AI API'nizi olusturarak baslayın.
              <br />
              Sadece bir prompt yazmaniz yeterli!
            </p>
            <Link href="/dashboard/apis/new" className="mt-6">
              <Button variant="gradient">
                <Plus className="mr-2 h-4 w-4" />
                Ilk API'nizi Olusturun
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apis.map((api) => (
            <Card key={api.id} className="group relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">{api.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {api.description}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      api.status === 'active'
                        ? 'success'
                        : api.status === 'error'
                        ? 'destructive'
                        : api.status === 'paused'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {api.status === 'active'
                      ? 'Aktif'
                      : api.status === 'draft'
                      ? 'Taslak'
                      : api.status === 'paused'
                      ? 'Duraklatildi'
                      : api.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Endpoint */}
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Endpoint</p>
                    <code className="text-sm font-mono">
                      /api/v1/{api.slug}
                    </code>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {api._count.usageLogs} istek
                    </span>
                    <span className="text-muted-foreground">
                      {formatRelativeTime(api.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/apis/${api.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        Detaylar
                      </Button>
                    </Link>
                    <Link href={`/dashboard/apis/${api.id}/test`} className="flex-1">
                      <Button variant="secondary" className="w-full" size="sm">
                        Test Et
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
