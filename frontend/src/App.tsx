import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import type { Collection, Figure, FilamentColor } from './services/api';
import FilterSidebar from './components/FilterSidebar';
import ShowcaseGrid from './components/ShowcaseGrid';
import FigureDetailModal from './components/FigureDetailModal';
import AdminDashboard from './components/AdminDashboard';
import {
  Compass, Shield, LogIn, Loader2, Eye
} from 'lucide-react';

const GezginFigurApp: React.FC = () => {
  const { user, loading: authLoading, isAdmin, login } = useAuth();

  // View states
  const [view, setView] = useState<'gallery' | 'admin'>('gallery');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [filamentColors, setFilamentColors] = useState<FilamentColor[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Navigation states
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);

  // Load backend data
  const loadData = async () => {
    setDataLoading(true);
    try {
      const [allCollections, allFigures] = await Promise.all([
        api.getCollections(),
        api.getFigures(),
      ]);
      setCollections(allCollections);
      setFigures(allFigures);
    } catch (error) {
      console.error('Figür veritabanı yüklenemedi:', error);
    } finally {
      setDataLoading(false);
    }

    try {
      const allFilamentColors = await api.getFilamentColors();
      setFilamentColors(allFilamentColors);
    } catch {
      setFilamentColors([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter figures based on selected collection in sidebar
  const getFilteredFigures = (): Figure[] => {
    if (!activeCollectionId) return figures;
    return figures.filter((fig) => {
      const ids = fig.collectionIds || [];
      return ids.some((c: any) =>
        typeof c === 'object' ? c._id === activeCollectionId : c === activeCollectionId
      );
    });
  };

  const filteredFigures = getFilteredFigures();

  // Redirect back to gallery if admin changes or logs out
  useEffect(() => {
    if (!isAdmin && view === 'admin') {
      setView('gallery');
    }
  }, [isAdmin, view]);

  return (
    <>
      {/* Top Navbar Header */}
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="brand" onClick={() => setView('gallery')} style={{ cursor: 'pointer' }}>
            <Compass className="brand-accent animate-pulse-slow" size={24} />
            <span>Gezgin<span className="brand-accent">Figür</span></span>
          </div>

          <div className="nav-links">
            <button
              onClick={() => setView('gallery')}
              className={`btn btn-secondary btn-sm ${view === 'gallery' ? 'btn-primary' : ''}`}
            >
              <Eye size={16} />
              Sergi Galerisi
            </button>

            {authLoading ? (
              <Loader2 className="animate-spin" size={20} style={{ color: 'var(--primary)' }} />
            ) : user ? (
              <>
                {isAdmin && (
                  <button
                    onClick={() => setView('admin')}
                    className={`btn btn-secondary btn-sm ${view === 'admin' ? 'btn-primary' : ''}`}
                  >
                    <Shield size={16} />
                    Yönetim Paneli
                  </button>
                )}
                <img
                  src={user.avatarUrl || 'https://github.com/identicons/default.png'}
                  alt={user.username}
                  className="user-avatar"
                  title={`${user.username} (${user.role})`}
                />
              </>
            ) : (
              <button onClick={login} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
                <LogIn size={16} />
                Admin Girişi
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main View Router */}
      <main className="container flex-grow" style={{ minHeight: 'calc(100vh - 160px)' }}>
        {view === 'gallery' ? (
          <>
            {/* Showcase Hero Area */}
            <section className="hero-section">
              <div className="hero-glow"></div>
              <h1 className="animate-slide-up">3D Figür Dijital Arşivi</h1>
              <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Özel el boyaması figürler, koleksiyonluk minyatür arşivleri ve detaylı 3D baskı çalışmaları vitrini. Tematik koleksiyonları aşağıda keşfedebilirsiniz.
              </p>
            </section>

            {/* Content loading state */}
            {dataLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
                <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
                <p style={{ color: 'var(--text-muted)' }}>Figür veritabanı yükleniyor...</p>
              </div>
            ) : (
              /* Two-column responsive gallery grid */
              <div className="showcase-layout animate-fade-in">
                <FilterSidebar
                  collections={collections}
                  activeCollectionId={activeCollectionId}
                  onSelectCollection={setActiveCollectionId}
                  figures={figures}
                />

                <ShowcaseGrid
                  figures={filteredFigures}
                  collections={collections}
                  onSelectFigure={setSelectedFigure}
                />
              </div>
            )}
          </>
        ) : (
          /* Protected Admin Dashboard page */
          isAdmin ? (
            <AdminDashboard
              collections={collections}
              figures={figures}
              filamentColors={filamentColors}
              onRefreshData={loadData}
              onBackToGallery={() => setView('gallery')}
            />
          ) : (
            /* Backup denial page if routing bypasses */
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <div className="empty-state" style={{ maxWidth: '450px' }}>
                <Shield size={40} style={{ color: 'rgb(239, 68, 68)' }} />
                <h3>Erişim Engellendi</h3>
                <p>Figür listelerini ve koleksiyonları yönetmek için yetkili bir yönetici olarak giriş yapmalısınız.</p>
                <button onClick={login} className="btn btn-primary btn-sm">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  GitHub Admin ile Giriş Yap
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Pop-up detail modal */}
      {selectedFigure && (
        <FigureDetailModal
          figure={selectedFigure}
          onClose={() => setSelectedFigure(null)}
          collections={collections}
        />
      )}

      {/* Premium Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-logo">
            Gezgin<span className="brand-accent">Figür</span>
          </div>
          <p className="footer-text">
            © {new Date().getFullYear()} GezginFigür
          </p>
        </div>
      </footer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GezginFigurApp />
    </AuthProvider>
  );
};

export default App;
