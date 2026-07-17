import WalletButton from '@/components/WalletButton';
import { AuroraBackground, Marquee, Particles } from '@/components/effects';
import { PageLayout } from '@/components/poof-ui';
import { Button } from '@/components/ui/button';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { GENRES } from '@/utils/studybeats';
import { ArrowRight, FileText, Heart, ListMusic, Play, Sparkles, Timer, Waves } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STEPS = [
  {
    n: '01',
    title: 'Upload your notes',
    desc: 'Drop a PDF, DOCX, or plain text — or just paste your notes straight in.',
    icon: FileText,
  },
  {
    n: '02',
    title: 'Choose your vibe',
    desc: 'Pick a genre, a vocal style, a mood, and a length that matches your study session.',
    icon: Sparkles,
  },
  {
    n: '03',
    title: 'Vibe to it',
    desc: 'Your notes come back as a song you actually want to play on repeat.',
    icon: Play,
  },
];

const FEATURES = [
  {
    title: 'Any format, one workflow',
    desc: 'PDFs, DOCX, raw text — StudyBeats turns whatever you throw at it into material ready for a song.',
    icon: FileText,
    big: true,
  },
  {
    title: 'A genre for every mood',
    desc: 'Lo-fi for 2am cramming, EDM for a pump-up review sprint, orchestral for the dramatic finale chapter.',
    icon: Sparkles,
  },
  {
    title: 'Study Sessions',
    desc: 'Chain songs into focus blocks — a soundtrack built entirely from your own syllabus.',
    icon: Timer,
  },
  {
    title: 'Playlists & Favorites',
    desc: 'Build a revision playlist for finals week. Favorite the hooks that actually stuck.',
    icon: ListMusic,
  },
];

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAppAuth();
  const navigate = useNavigate();

  const primaryHref = isAuthenticated ? '/dashboard' : '/login';

  return (
    <PageLayout fullBleed>
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Waves className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              StudyBeats<span className="text-primary">.</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <WalletButton />
            <Button size="sm" onClick={() => navigate(primaryHref)} className="hidden sm:flex">
              {isAuthenticated ? 'Open App' : 'Get Started'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-spotlight">
        <AuroraBackground />
        <div className="container relative z-10 grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <span className="text-overline animate-fade-in">AI study soundtrack</span>
            <h1 className="text-display mt-4 animate-fade-in-up delay-1">
              Don't Just Read Your Notes.
              <br />
              <span className="gradient-text">Vibe To Them.</span>
            </h1>
            <p className="text-subhead mt-5 max-w-lg animate-fade-in-up delay-2">
              Upload your lecture notes, PDFs, or slides. StudyBeats AI turns them into original songs —
              pick the genre, the vocal style, the mood — so revision finally sounds like something
              you'd choose to listen to.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-in-up delay-3">
              <Button size="lg" className="gap-2" onClick={() => navigate(primaryHref)}>
                {isAuthenticated ? 'Open Dashboard' : 'Start Vibing — Free'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Continue as Guest</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground animate-fade-in-up delay-4">
              No wallet needed to try it — guest mode gets you into the full app in one click.
            </p>
          </div>

          {/* Floating mock player card */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-sm animate-scale-in delay-2 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
              <div
                className="relative h-48 w-full overflow-hidden rounded-2xl"
                style={{ background: 'linear-gradient(135deg,#10e0a1 0%,#7c3aed 100%)' }}
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-3 right-3 flex items-end gap-1 rounded bg-black/30 px-2 py-1.5">
                  {[6, 12, 9, 15, 7].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-white/90 animate-pulse"
                      style={{ height: h, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="font-semibold">Mitochondria Anthem</p>
                <p className="text-xs text-muted-foreground">Warm Female · Lo-Fi · 2:34</p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Play className="h-4 w-4 fill-current" />
                </button>
                <div className="h-1.5 flex-1 rounded-full bg-secondary">
                  <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary to-accent" />
                </div>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/30 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Genre marquee */}
      <section className="border-y border-border/40 bg-secondary/20 py-6">
        <Marquee pauseOnHover>
          {GENRES.map(g => (
            <div
              key={g.value}
              className="mx-3 flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {g.label}
            </div>
          ))}
        </Marquee>
      </section>

      {/* How it works */}
      <section className="relative py-24">
        <div className="container">
          <div className="mb-14 max-w-xl">
            <span className="text-overline">How it works</span>
            <h2 className="text-headline mt-3">Three steps between your syllabus and your speakers.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.n}
                  className={`animate-fade-in-up delay-${i + 1} relative rounded-2xl border border-border/60 bg-card/60 p-7`}
                  style={{ marginTop: i % 2 === 1 ? '1.5rem' : 0 }}
                >
                  <span className="text-5xl font-bold text-primary/15">{step.n}</span>
                  <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/30">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                  {i < STEPS.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 border-t border-dashed border-primary/40 lg:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature bento */}
      <section className="relative overflow-hidden bg-secondary/10 py-24">
        <Particles quantity={40} />
        <div className="container relative z-10">
          <div className="mb-14 max-w-xl">
            <span className="text-overline">Built for the way you actually study</span>
            <h2 className="text-headline mt-3">Everything a study soundtrack needs.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`group rounded-2xl border border-border/60 bg-card/70 p-7 transition-all hover:-translate-y-1 hover:border-primary/40 ${
                    f.big ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/20">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="container relative z-10 flex flex-col items-center text-center">
          <h2 className="text-headline max-w-xl">
            Your notes have never sounded this good. <span className="gradient-text">Let's fix that.</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Jump in as a guest right now — full app, zero setup, zero wallet required.
          </p>
          <Button size="lg" className="mt-8 gap-2" onClick={() => navigate(primaryHref)}>
            {isAuthenticated ? 'Open Dashboard' : 'Start Vibing — It\'s Free'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

export default HomePage;
