/**
 * API Routes - Register all routes here.
 *
 * Two things to do when adding a route:
 * 1. Register the handler with app.get/post/put/delete/patch
 * 2. Add an entry to routeSpec[] so the API spec is generated for the platform
 *
 * For protected routes, use validatePoofAuth:
 *   import { validatePoofAuth } from '../lib/poof-auth.js';
 *   const { walletAddress } = await validatePoofAuth(c);
 */

import type { Hono } from 'hono';
import { ApiErrors, sendSuccess } from '../lib/api-response.js';
import { AiBlockedError, AiError } from '../lib/poof-ai.js';
import { analyzeContent } from '../services/contentUnderstanding.js';
import { generateSummary } from '../services/summary.js';
import { generateFlashcards } from '../services/flashcards.js';
import { generateQuiz } from '../services/quiz.js';
import { generateLyrics } from '../services/lyricsGeneration.js';
import { getMusicProvider, MockMusicProvider } from '../services/musicProvider.js';

// OAuth Routes (uncomment to enable social login)
// See: .claude/skills/oauth/SKILL.md for setup instructions
// import { oauthCallbackHandler } from './oauth-callback.js';
// import { getSocialLinkHandler, deleteSocialLinkHandler } from './social-links.js';

const MIN_PIPELINE_TEXT_CHARS = 20;
const MAX_PIPELINE_TEXT_CHARS = 60000;

/**
 * Route spec for API documentation/display.
 * Keep this in sync with the actual route registrations below.
 */
export interface RouteSpec {
  method: string;
  path: string;
  description: string;
  auth: boolean;
}

export const routeSpec: RouteSpec[] = [
  { method: 'GET', path: '/health', description: 'Health check', auth: false },
  // OAuth routes (uncomment when enabled):
  // { method: 'GET', path: '/api/oauth/callback', description: 'OAuth callback', auth: false },
  // { method: 'GET', path: '/api/social-links/:provider', description: 'Get social link', auth: true },
  // { method: 'DELETE', path: '/api/social-links/:provider', description: 'Unlink social account', auth: true },

  // StudyBeats AI generation pipeline — stateless generators (no auth so Guest mode works too;
  // the frontend persists results via the real collections or the guest local store).
  {
    method: 'POST',
    path: '/api/pipeline/analyze',
    description: 'Analyze study text into a short/detailed summary + structured key concepts',
    auth: false,
  },
  {
    method: 'POST',
    path: '/api/pipeline/learning-package',
    description: 'Generate flashcards + quiz from study text',
    auth: false,
  },
  {
    method: 'POST',
    path: '/api/pipeline/lyrics',
    description: 'Generate educational song lyrics from a content analysis',
    auth: false,
  },
  {
    method: 'POST',
    path: '/api/pipeline/music',
    description: 'Generate (mock) music + lyric timestamps from lyrics',
    auth: false,
  },
];

export function registerRoutes(app: Hono): void {
  // Health check
  app.get('/health', (c) => sendSuccess(c, { status: 'ok', timestamp: Date.now() }));

  // OAuth routes (uncomment to enable):
  // app.get('/api/oauth/callback', oauthCallbackHandler);
  // app.get('/api/social-links/:provider', getSocialLinkHandler);
  // app.delete('/api/social-links/:provider', deleteSocialLinkHandler);

  // Add your routes here:
  // app.get('/api/items', (c) => sendSuccess(c, { items: [] }));
  // app.post('/api/items', async (c) => {
  //   const { walletAddress } = await validatePoofAuth(c);
  //   const body = await c.req.json();
  //   return sendSuccess(c, { created: true });
  // });

  // ---- StudyBeats AI generation pipeline ----
  // Stateless generators only — they never write to Tarobase. The frontend
  // persists everything (real collections or guest local store) so both
  // authenticated users and Guest mode work through the same endpoints.

  app.post('/api/pipeline/analyze', async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const text = typeof body?.text === 'string' ? body.text : '';
      if (text.trim().length < MIN_PIPELINE_TEXT_CHARS) {
        return ApiErrors.badRequest(c, 'Text is too short to analyze.');
      }
      if (text.length > MAX_PIPELINE_TEXT_CHARS) {
        return ApiErrors.badRequest(c, `Text is too long (max ${MAX_PIPELINE_TEXT_CHARS} characters).`);
      }

      const [analysis, summary] = await Promise.all([
        analyzeContent(c.env, text),
        generateSummary(c.env, text),
      ]);

      return sendSuccess(c, {
        shortSummary: summary.shortSummary,
        detailedSummary: summary.detailedSummary,
        keyConcepts: analysis,
      });
    } catch (e) {
      if (e instanceof AiBlockedError) return ApiErrors.badRequest(c, 'AI usage limit reached.');
      if (e instanceof AiError) return ApiErrors.internal(c, `AI error: ${e.message}`);
      console.error('pipeline/analyze failed', e);
      return ApiErrors.internal(c, 'Failed to analyze study material.');
    }
  });

  app.post('/api/pipeline/learning-package', async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const text = typeof body?.text === 'string' ? body.text : '';
      if (text.trim().length < MIN_PIPELINE_TEXT_CHARS) {
        return ApiErrors.badRequest(c, 'Text is too short to build a learning package.');
      }
      if (text.length > MAX_PIPELINE_TEXT_CHARS) {
        return ApiErrors.badRequest(c, `Text is too long (max ${MAX_PIPELINE_TEXT_CHARS} characters).`);
      }

      const [flashcards, quiz] = await Promise.all([
        generateFlashcards(c.env, text),
        generateQuiz(c.env, text),
      ]);

      return sendSuccess(c, { flashcards, quiz });
    } catch (e) {
      if (e instanceof AiBlockedError) return ApiErrors.badRequest(c, 'AI usage limit reached.');
      if (e instanceof AiError) return ApiErrors.internal(c, `AI error: ${e.message}`);
      console.error('pipeline/learning-package failed', e);
      return ApiErrors.internal(c, 'Failed to build the learning package.');
    }
  });

  app.post('/api/pipeline/lyrics', async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const { analysis, genre, mood, language, durationSec, vocalStyle } = body ?? {};
      if (!analysis || typeof analysis !== 'object') {
        return ApiErrors.badRequest(c, 'Missing analysis for lyrics generation.');
      }
      if (typeof genre !== 'string' || typeof vocalStyle !== 'string') {
        return ApiErrors.badRequest(c, 'Missing genre or vocalStyle.');
      }

      const lyrics = await generateLyrics(c.env, analysis, {
        genre,
        mood: typeof mood === 'string' ? mood : undefined,
        language: typeof language === 'string' ? language : undefined,
        durationSec: typeof durationSec === 'number' ? durationSec : 150,
        vocalStyle,
      });

      return sendSuccess(c, lyrics);
    } catch (e) {
      if (e instanceof AiBlockedError) return ApiErrors.badRequest(c, 'AI usage limit reached.');
      if (e instanceof AiError) return ApiErrors.internal(c, `AI error: ${e.message}`);
      console.error('pipeline/lyrics failed', e);
      return ApiErrors.internal(c, 'Failed to generate lyrics.');
    }
  });

  app.post('/api/pipeline/music', async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const { lyrics, genre, mood, language, durationSec, vocalStyle } = body ?? {};
      if (typeof lyrics !== 'string' || lyrics.trim().length === 0) {
        return ApiErrors.badRequest(c, 'Missing lyrics for music generation.');
      }
      if (typeof genre !== 'string' || typeof vocalStyle !== 'string') {
        return ApiErrors.badRequest(c, 'Missing genre or vocalStyle.');
      }

      const provider = getMusicProvider(c.env);
      try {
        const output = await provider.generate({
          lyrics,
          genre,
          mood: typeof mood === 'string' ? mood : undefined,
          language: typeof language === 'string' ? language : undefined,
          durationSec: typeof durationSec === 'number' ? durationSec : 150,
          vocalStyle,
        });

        return sendSuccess(c, output);
      } catch (e) {
        console.error('Mureka music generation failed, falling back to mock provider:', e);
        const mockProvider = new MockMusicProvider();
        const output = await mockProvider.generate({
          lyrics,
          genre,
          mood: typeof mood === 'string' ? mood : undefined,
          language: typeof language === 'string' ? language : undefined,
          durationSec: typeof durationSec === 'number' ? durationSec : 150,
          vocalStyle,
        });
        if (output.metadata) {
          output.metadata.fallbackReason = e instanceof Error ? e.message : String(e);
        }
        return sendSuccess(c, output);
      }
    } catch (e) {
      console.error('pipeline/music failed', e);
      return ApiErrors.internal(c, 'Music generation is currently unavailable.');
    }
  });
}
