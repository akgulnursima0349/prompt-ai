import Link from 'next/link';
import { ArrowRight, Zap, Code, Shield, Gauge, Sparkles, Terminal } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/50 to-background dark:from-brand-950/20" />
          <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-200/40 via-transparent to-transparent dark:from-brand-800/20" />

          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="info" className="mb-4">
                <Sparkles className="mr-1 h-3 w-3" />
                Yeni: Llama 3.1 70B destegi eklendi
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Dogal Dil ile{' '}
                <span className="gradient-text">AI API'leri</span>{' '}
                Olusturun
              </h1>

              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Prompt yazin, API'nizi alin. PromptAI ile sirketinize ozel yapay zeka
                cozumleri olusturun. Kod yazmadan, dakikalar icinde.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button variant="gradient" size="xl">
                    Ucretsiz Baslayin
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button variant="outline" size="xl">
                    <Terminal className="mr-2 h-5 w-5" />
                    Dokumantasyon
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Kredi karti gerektirmez. 100 ucretsiz API istegi.
              </p>
            </div>
          </div>
        </section>

        {/* Demo Preview */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-xl border bg-card shadow-2xl">
                <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm text-muted-foreground">promptai.com/dashboard</span>
                </div>
                <div className="p-6 md:p-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Prompt Input */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium">Prompt'unuzu yazin:</label>
                      <div className="rounded-lg border bg-background p-4 font-mono text-sm">
                        <p className="text-muted-foreground">
                          "Musteri yorumlarini analiz eden ve duygu durumunu
                          (pozitif/negatif/notr) belirleyen bir API olustur.
                          Ayrica yorumdaki ana konulari cikar."
                        </p>
                      </div>
                      <Button variant="gradient" className="w-full">
                        <Zap className="mr-2 h-4 w-4" />
                        API Olustur
                      </Button>
                    </div>

                    {/* Generated Output */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium">Olusturulan API:</label>
                      <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs">
                        <pre className="overflow-x-auto text-green-600 dark:text-green-400">
{`POST /api/v1/sentiment-analyzer

{
  "text": "Urun harika!"
}

Response:
{
  "sentiment": "positive",
  "confidence": 0.94,
  "topics": ["product_quality"]
}`}
                        </pre>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="success">Aktif</Badge>
                        <Badge variant="outline">pak_xxx...xxx</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                Neden PromptAI?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Yapay zeka API'leri olusturmanin en kolay ve en hizli yolu.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
                    <Zap className="h-6 w-6 text-brand-600" />
                  </div>
                  <CardTitle className="mt-4">Aninda API</CardTitle>
                  <CardDescription>
                    Prompt yazin, saniyeler icinde production-ready API'nizi alin.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <Code className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="mt-4">Kod Gerektirmez</CardTitle>
                  <CardDescription>
                    Backend, hosting, scaling... Hepsini biz hallederiz. Siz sadece prompt yazin.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="mt-4">Guvenli & Olceklenebilir</CardTitle>
                  <CardDescription>
                    API key yonetimi, rate limiting ve enterprise-grade guvenlik.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Gauge className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="mt-4">Dusuk Gecikme</CardTitle>
                  <CardDescription>
                    En hizli AI modellerini kullanarak milisaniyeler icinde yanit alin.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900">
                    <Sparkles className="h-6 w-6 text-pink-600" />
                  </div>
                  <CardTitle className="mt-4">Akilli Oneri</CardTitle>
                  <CardDescription>
                    AI, prompt'unuza gore en uygun yapilandirmayi otomatik oner.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900">
                    <Terminal className="h-6 w-6 text-cyan-600" />
                  </div>
                  <CardTitle className="mt-4">Kolay Entegrasyon</CardTitle>
                  <CardDescription>
                    RESTful API, SDK'lar ve webhooks ile hizli entegrasyon.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                AI API'nizi Simdi Olusturun
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Ucretsiz hesap olusturun ve ilk API'nizi dakikalar icinde hayata gecirin.
              </p>
              <Link href="/register" className="mt-8 inline-block">
                <Button variant="gradient" size="xl">
                  Ucretsiz Baslayin
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
