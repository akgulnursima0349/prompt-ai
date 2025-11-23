import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@prompt-ai/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Key, BarChart3, ArrowRight, Plus, Zap } from 'lucide-react';

interface DashboardApi {
  id: string;
  name: string;
  description: string;
  status: string;
  usageCount: number;
  apiKeys: { id: string }[];
}

async function getDashboardData(userId: string) {
  const [apis, totalUsage] = await Promise.all([
    prisma.generatedAPI.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        apiKeys: {
          select: { id: true },
        },
      },
    }),
    prisma.usageLog.count({
      where: { userId },
    }),
  ]);

  const activeApis = apis.filter((api: DashboardApi) => api.status === 'active').length;
  const totalKeys = apis.reduce((acc: number, api: DashboardApi) => acc + api.apiKeys.length, 0);

  return { apis, activeApis, totalKeys, totalUsage };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const { apis, activeApis, totalKeys, totalUsage } = await getDashboardData(session!.user.id);

  const stats = [
    {
      name: 'Toplam API',
      value: apis.length,
      icon: Code,
      color: 'text-brand-600',
      bgColor: 'bg-brand-100 dark:bg-brand-900',
    },
    {
      name: 'Aktif API',
      value: activeApis,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      name: 'API Anahtari',
      value: totalKeys,
      icon: Key,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
    {
      name: 'Toplam Istek',
      value: totalUsage,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent APIs */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Hizli Islemler</CardTitle>
            <CardDescription>En sik kullanilan islemler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/apis/new">
              <Button variant="gradient" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Yeni API Olustur
              </Button>
            </Link>
            <Link href="/dashboard/apis">
              <Button variant="outline" className="w-full justify-start">
                <Code className="mr-2 h-4 w-4" />
                API'lerimi Gor
              </Button>
            </Link>
            <Link href="/dashboard/keys">
              <Button variant="outline" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                API Anahtarlarini Yonet
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent APIs */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Son API'ler</CardTitle>
              <CardDescription>En son olusturulan API'leriniz</CardDescription>
            </div>
            <Link href="/dashboard/apis">
              <Button variant="ghost" size="sm">
                Tumu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {apis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3">
                  <Code className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Henuz API olusturmadiniz
                </p>
                <Link href="/dashboard/apis/new" className="mt-4">
                  <Button variant="gradient" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Ilk API'nizi Olusturun
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {apis.map((api: DashboardApi) => (
                  <Link
                    key={api.id}
                    href={`/dashboard/apis/${api.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{api.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {api.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          api.status === 'active'
                            ? 'success'
                            : api.status === 'error'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {api.status === 'active' ? 'Aktif' : api.status === 'draft' ? 'Taslak' : api.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {api.usageCount} istek
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
