import { AuroraBackground } from '@/components/effects';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { ArrowRight, Sparkles, Waves } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { user, isGuest, loading, login, enterGuestMode } = useAppAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (user || isGuest)) navigate('/dashboard', { replace: true });
  }, [user, isGuest, loading, navigate]);

  const handleWalletAuth = async () => {
    try {
      await login();
    } catch {
      toast.error('Wallet connection failed. Try Guest mode instead.');
    }
  };

  const handleGoogle = () => {
    toast.info('Google sign-in is coming soon — try Continue as Guest for the full demo.');
  };

  const handleGuest = () => {
    enterGuestMode();
    toast.success('Welcome! Browsing as Guest.');
    navigate('/dashboard');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <AuroraBackground />
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <Waves className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to StudyBeats AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Don't just read your notes. Vibe to them.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8">
          <Tabs value={mode} onValueChange={v => setMode(v as 'login' | 'register')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </Tabs>

          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              toast.info('Email/password auth is coming soon — connect a wallet or continue as guest.');
            }}
          >
            {mode === 'register' && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" placeholder="Ada Lovelace" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@university.edu" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" variant="secondary">
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full gap-2" onClick={handleGoogle}>
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12s3.36-7.27 7.19-7.27c3.08 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.19 2C6.42 2 1.94 6.8 1.94 12s4.48 10 10.25 10c5.35 0 9.5-3.7 9.5-9.5 0-1.06-.11-1.65-.34-2.4z"
                />
              </svg>
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={handleWalletAuth}>
              <Sparkles className="h-4 w-4" />
              Connect Solana Wallet
            </Button>
            <Button
              className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              onClick={handleGuest}
            >
              Continue as Guest
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Guest mode unlocks the full demo instantly — no wallet required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
