import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@prompt-ai/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Mail, CreditCard, Shield } from 'lucide-react';

async function getUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
      _count: {
        select: {
          apis: true,
          usageLogs: true,
        },
      },
    },
  });
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const user = await getUserData(session!.user.id);

  if (!user) return null;

  const planLimits = {
    free: { apis: 3, requests: 100 },
    starter: { apis: 10, requests: 1000 },
    pro: { apis: 50, requests: 10000 },
    enterprise: { apis: -1, requests: -1 },
  };

  const currentPlan = planLimits[user.plan as keyof typeof planLimits] || planLimits.free;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">
          Hesap ayarlarinizi yonetin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil
            </CardTitle>
            <CardDescription>
              Temel hesap bilgileriniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Isim</label>
              <Input defaultValue={user.name || ''} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue={user.email} disabled />
              <p className="text-xs text-muted-foreground">
                Email degistirmek icin destek ile iletisime gecin
              </p>
            </div>
            <Button variant="outline">Degisiklikleri Kaydet</Button>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plan
            </CardTitle>
            <CardDescription>
              Mevcut abonelik planiniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{user.plan} Plan</span>
                  <Badge variant="info">Aktif</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentPlan.apis === -1 ? 'Sinirsiz' : currentPlan.apis} API, {' '}
                  {currentPlan.requests === -1 ? 'Sinirsiz' : currentPlan.requests} gunluk istek
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Kullanilan API</span>
                <span>{user._count.apis} / {currentPlan.apis === -1 ? '∞' : currentPlan.apis}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all"
                  style={{
                    width: currentPlan.apis === -1
                      ? '10%'
                      : `${Math.min(100, (user._count.apis / currentPlan.apis) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <Button variant="gradient" className="w-full">
              Plani Yukselt
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Guvenlik
            </CardTitle>
            <CardDescription>
              Hesap guvenlik ayarlari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mevcut Sifre</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yeni Sifre</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yeni Sifre (Tekrar)</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button variant="outline">Sifreyi Degistir</Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600">Tehlikeli Bolge</CardTitle>
            <CardDescription>
              Bu islemler geri alinamaz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-red-200 dark:border-red-900 p-4">
              <h4 className="font-medium">Hesabi Sil</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Hesabinizi ve tum verilerinizi kalici olarak silin. Bu islem geri alinamaz.
              </p>
              <Button variant="destructive" className="mt-4" size="sm">
                Hesabi Sil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
