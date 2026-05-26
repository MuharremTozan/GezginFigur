import React, { useEffect } from 'react';
import type { Figure, Collection } from '../services/api';
import { X, Calendar, Tag } from 'lucide-react';

interface FigureDetailModalProps {
  figure: Figure;
  onClose: () => void;
  collections: Collection[];
}

export const FigureDetailModal: React.FC<FigureDetailModalProps> = ({
  figure,
  onClose,
  collections,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Helper to map collection IDs to names
  const getCollectionNames = (): string[] => {
    const ids = figure.collectionIds || [];
    return ids.map((c: any) => {
      if (typeof c === 'object' && c !== null) {
        return c.name;
      }
      // If only ID is present, find in active list
      const matched = collections.find((col) => col._id === c);
      return matched ? matched.name : '';
    }).filter(Boolean);
  };

  const collectionNames = getCollectionNames();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Kapat">
          <X size={20} />
        </button>
        <div className="modal-layout">
          <div className="modal-media">
            <img
              src={figure.image || 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800'}
              alt={figure.title}
              className="modal-img"
            />
          </div>
          <div className="modal-body">
            <div>
              <span className="badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 600 }}>
                Sergi Figürü
              </span>
              <h2 className="modal-title" style={{ marginTop: '8px' }}>{figure.title}</h2>
            </div>
            
            <div className="modal-desc" style={{ color: 'var(--text-muted)' }}>
              {figure.description || 'Bu benzersiz sergi figürü için açıklama belirtilmemiş.'}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)', margin: '8px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {collectionNames.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Tag size={16} style={{ color: 'var(--primary)', marginTop: '4px' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--fg)' }}>Koleksiyonlar</div>
                    <div className="card-tags" style={{ marginTop: '4px' }}>
                      {collectionNames.map((name, i) => (
                        <span key={i} className="card-tag">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {figure.createdAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <Calendar size={16} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span style={{ fontWeight: 600 }}>Eklendiği Tarih:</span>{' '}
                    {new Date(figure.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigureDetailModal;
