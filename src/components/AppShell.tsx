import PlayerBar from '@/components/PlayerBar';
import { PageHeader, PageLayout } from '@/components/poof-ui';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { shortAddress } from '@/utils/studybeats';
import {
  Download,
  Heart,
  History as HistoryIcon,
  LayoutDashboard,
  ListMusic,
  LogOut,
  Menu,
  Music2,
  Search,
  Settings,
  Sparkles,
  Timer,
  UploadCloud,
  User,
  Waves,
  Wallet,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload Notes', icon: UploadCloud },
  { to: '/generate', label: 'Generate Song', icon: Sparkles },
  { to: '/songs', label: 'My Songs', icon: Music2 },
  { to: '/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/sessions', label: 'Study Sessions', icon: Timer },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/downloads', label: 'Downloads', icon: Download },
];

function Logo() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2 px-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
        <Waves className="h-4.5 w-4.5 text-primary-foreground" />
      </div>
      <span className="text-lg font-bold tracking-tight">
        StudyBeats<span className="text-primary">.</span>
      </span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, isGuest, logout } = useAppAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 py-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-gradient-to-r from-primary/20 to-accent/10 text-foreground ring-1 ring-primary/30'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4', active && 'text-primary')} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 divider-gradient" />

        <Link
          to="/search"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            location.pathname === '/search'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
          )}
        >
          <Search className="h-4 w-4" />
          Search
        </Link>
        <Link
          to="/profile"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            location.pathname === '/profile'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
          )}
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <Link
          to="/settings"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            location.pathname === '/settings'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-2 rounded-xl bg-secondary/40 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
            {isGuest ? 'G' : <Wallet className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{isGuest ? 'Guest Session' : shortAddress(address)}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {isGuest ? 'Not saved to chain' : 'Wallet connected'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AppShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ title, description, actions, breadcrumbs, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isGuest, login } = useAppAuth();
  const { currentSong } = usePlayer();

  return (
    <PageLayout fullBleed footer={false}>
      <div className="flex min-h-screen bg-background">
        <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-sidebar lg:block">
          <div className="fixed h-screen w-64">
            <SidebarContent />
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar">
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <Logo />
          </div>

          {isGuest && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-accent/15 px-4 py-2 text-sm">
              <span className="text-accent-foreground/90">
                You're vibing as a <strong>Guest</strong> — data stays in this browser only.
              </span>
              <Button size="sm" variant="outline" onClick={() => login()}>
                Connect Wallet to Save
              </Button>
            </div>
          )}

          <main className={cn('flex-1 pb-24', currentSong && 'pb-28')}>
            <div className="container py-8">
              <PageHeader title={title} description={description} actions={actions} breadcrumbs={breadcrumbs} border />
              <div className="mt-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
      <PlayerBar />
    </PageLayout>
  );
};

export default AppShell;
