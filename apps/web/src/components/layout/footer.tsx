import Link from 'next/link';
import { Zap, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Prompt<span className="text-brand-600">AI</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Dogal dil ile AI API'leri olusturun. Kod yazmadan, dakikalar icinde.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold">Urun</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/features" className="hover:text-foreground">
                  Ozellikler
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground">
                  Fiyatlandirma
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-foreground">
                  Dokumantasyon
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-foreground">
                  Degisiklik Kaydi
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold">Sirket</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  Hakkimizda
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-foreground">
                  Kariyer
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Iletisim
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold">Yasal</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Gizlilik Politikasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Kullanim Sartlari
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-foreground">
                  Guvenlik
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PromptAI. Tum haklari saklidir.</p>
        </div>
      </div>
    </footer>
  );
}
