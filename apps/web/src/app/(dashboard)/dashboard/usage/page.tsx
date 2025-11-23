import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@prompt-ai/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

async function getUsageStats(userId: string) {
  const [totalRequests, successfulRequests, recentLogs, apiStats] = await Promise.all([
    prisma.usageLog.count({ where: { userId } }),
    prisma.usageLog.count({ where: { userId, statusCode: 200 } }),
    prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        api: { select: { name: true, slug: true } },
      },
    }),
    prisma.generatedAPI.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        usageCount: true,
        _count: { select: { usageLogs: true } },
      },
      orderBy: { usageCount: 'desc' },
      take: 5,
    }),
  ]);

  const avgLatency = await prisma.usageLog.aggregate({
    where: { userId, statusCode: 200 },
    _avg: { latencyMs: true },
  });

  return {
    totalRequests,
    successfulRequests,
    failedRequests: totalRequests - successfulRequests,
    successRate: totalRequests > 0 ? (successfulRequests / totalRequests * 100).toFixed(1) : 0,
    avgLatency: Math.round(avgLatency._avg.latencyMs || 0),
    recentLogs,
    apiStats,
  };
}

export default async function UsagePage() {
  const session = await getServerSession(authOptions);
  const stats = await getUsageStats(session!.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Kullanim Istatistikleri</h1>
        <p className="text-muted-foreground">
          API'lerinizin kullanim metrikleri
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Toplam Istek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Basari Orani
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Ort. Gecikme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgLatency}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Basarisiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedRequests}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top APIs */}
        <Card>
          <CardHeader>
            <CardTitle>En Cok Kullanilan API'ler</CardTitle>
            <CardDescription>Istek sayisina gore siralama</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.apiStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Henuz veri yok
              </p>
            ) : (
              <div className="space-y-4">
                {stats.apiStats.map((api, index) => (
                  <div key={api.id} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{api.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {api.usageCount} istek
                      </p>
                    </div>
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full"
                        style={{
                          width: `${Math.min(100, (api.usageCount / (stats.apiStats[0]?.usageCount || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Son Istekler</CardTitle>
            <CardDescription>En son yapilan API istekleri</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Henuz istek yapilmadi
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {stats.recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {log.statusCode === 200 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{log.api.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(log.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={log.statusCode === 200 ? 'success' : 'destructive'}>
                        {log.statusCode}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {log.latencyMs}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
