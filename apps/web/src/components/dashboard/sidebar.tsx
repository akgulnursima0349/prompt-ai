'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Zap,
  LayoutDashboard,
  Code,
  Key,
  BarChart3,
  Settings,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'API\'lerim', href: '/dashboard/apis', icon: Code },
  { name: 'API Anahtarlari', href: '/dashboard/keys', icon: Key },
  { name: 'Kullanim', href: '/dashboard/usage', icon: BarChart3 },
  { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r bg-card lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Prompt<span className="text-brand-600">AI</span>
            </span>
          </Link>
        </div>

        {/* Create API Button */}
        <div className="p-4">
          <Link href="/dashboard/apis/new">
            <Button variant="gradient" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Yeni API Olustur
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-100'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Help */}
        <div className="border-t p-4">
          <Link
            href="/docs"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <HelpCircle className="h-5 w-5" />
            Yardim & Dokumantasyon
          </Link>
        </div>
      </div>
    </aside>
  );
}
