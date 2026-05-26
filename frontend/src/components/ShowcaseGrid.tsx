import React, { useState } from 'react';
import type { Figure, Collection } from '../services/api';
import { Search, Inbox } from 'lucide-react';

interface ShowcaseGridProps {
  figures: Figure[];
  collections: Collection[];
  onSelectFigure: (fig: Figure) => void;
}

export const ShowcaseGrid: React.FC<ShowcaseGridProps> = ({
  figures,
  collections,
  onSelectFigure,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Local filter for search query
  const filteredFigures = figures.filter((fig) => {
    const titleMatch = fig.title.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (fig.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || descMatch;
  });

  // Mapper to find collection names for badges
  const getCollectionNames = (fig: Figure): string[] => {
    const ids = fig.collectionIds || [];
    return ids.map((c: any) => {
      if (typeof c === 'object' && c !== null) return c.name;
      const matched = collections.find((col) => col._id === c);
      return matched ? matched.name : '';
    }).filter(Boolean);
  };

  return (
    <div className="gallery-container">
      {/* Search Input Bar */}
      <div className="search-bar-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Figürleri başlık veya açıklamaya göre arayın..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid List */}
      {filteredFigures.length > 0 ? (
        <div className="figure-grid">
          {filteredFigures.map((fig) => {
            const tagNames = getCollectionNames(fig);
            return (
              <article
                key={fig._id}
                className="figure-card"
                onClick={() => onSelectFigure(fig)}
              >
                <div className="card-img-wrapper">
                  <img
                    src={fig.image || 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800'}
                    alt={fig.title}
                    className="card-img"
                    loading="lazy"
                  />
                </div>
                <div className="card-info">
                  <h4 className="card-title">{fig.title}</h4>
                  <p className="card-desc">
                    {fig.description || 'Açıklama belirtilmemiş.'}
                  </p>
                  {tagNames.length > 0 && (
                    <div className="card-tags">
                      {tagNames.map((name, idx) => (
                        <span key={idx} className="card-tag">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state">
          <Inbox className="empty-icon animate-pulse-slow" />
          <h3>Hiçbir figür bulunamadı</h3>
          <p>
            "{searchQuery}" aramasıyla eşleşen herhangi bir figür bulamadık. Aramanızı düzenlemeyi veya başka bir koleksiyon seçmeyi deneyin.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShowcaseGrid;
