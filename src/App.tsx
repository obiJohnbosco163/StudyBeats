import DashboardPage from '@/components/DashboardPage';
import DownloadsPage from '@/components/DownloadsPage';
import FavoritesPage from '@/components/FavoritesPage';
import GeneratePage from '@/components/GeneratePage';
import HistoryPage from '@/components/HistoryPage';
import HomePage from '@/components/HomePage';
import LoginPage from '@/components/LoginPage';
import PlaylistDetailPage from '@/components/PlaylistDetailPage';
import PlaylistsPage from '@/components/PlaylistsPage';
import ProfilePage from '@/components/ProfilePage';
import SearchPage from '@/components/SearchPage';
import SettingsPage from '@/components/SettingsPage';
import SongDetailPage from '@/components/SongDetailPage';
import SongsPage from '@/components/SongsPage';
import StudySessionDetailPage from '@/components/StudySessionDetailPage';
import StudySessionsPage from '@/components/StudySessionsPage';
import UploadPage from '@/components/UploadPage';
import { Toaster } from '@/components/ui/sonner';
import { AppAuthProvider, useAppAuth } from '@/contexts/AppAuthContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { ThemeProvider } from '@/hooks/use-theme';
// import { OAuthProvider } from '@/contexts/OAuthContext';
import { JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

/** Gate for the authenticated app — lets real wallet users OR guests through. */
function RequireSession({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAppAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/login' element={<LoginPage />} />

      <Route path='/dashboard' element={<RequireSession><DashboardPage /></RequireSession>} />
      <Route path='/upload' element={<RequireSession><UploadPage /></RequireSession>} />
      <Route path='/generate' element={<RequireSession><GeneratePage /></RequireSession>} />
      <Route path='/songs' element={<RequireSession><SongsPage /></RequireSession>} />
      <Route path='/songs/:songId' element={<RequireSession><SongDetailPage /></RequireSession>} />
      <Route path='/playlists' element={<RequireSession><PlaylistsPage /></RequireSession>} />
      <Route path='/playlists/:playlistId' element={<RequireSession><PlaylistDetailPage /></RequireSession>} />
      <Route path='/sessions' element={<RequireSession><StudySessionsPage /></RequireSession>} />
      <Route path='/sessions/:sessionId' element={<RequireSession><StudySessionDetailPage /></RequireSession>} />
      <Route path='/favorites' element={<RequireSession><FavoritesPage /></RequireSession>} />
      <Route path='/history' element={<RequireSession><HistoryPage /></RequireSession>} />
      <Route path='/downloads' element={<RequireSession><DownloadsPage /></RequireSession>} />
      <Route path='/profile' element={<RequireSession><ProfilePage /></RequireSession>} />
      <Route path='/settings' element={<RequireSession><SettingsPage /></RequireSession>} />
      <Route path='/search' element={<RequireSession><SearchPage /></RequireSession>} />

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

function App(): JSX.Element {
  return (
    <ThemeProvider>
      {/* NOTE: UI Generator - Uncomment OAuthProvider wrapper below if OAuth functionality is needed.
          See .claude/skills/oauth/docs/implementation-guide.md for OAuth implementation guide. */}
      {/* <OAuthProvider> */}
      <AppAuthProvider>
        <PlayerProvider>
          <div
            id='app-container'
            className='relative min-h-screen flex flex-col bg-background'
          >
            <main id='app-main' className='flex-1'>
              <AppRoutes />
            </main>

            <Toaster />
          </div>
        </PlayerProvider>
      </AppAuthProvider>
      {/* </OAuthProvider> */}
    </ThemeProvider>
  );
}

export default App;
