import React from 'react';
import type { Collection, Figure } from '../services/api';
import { Layers } from 'lucide-react';

interface FilterSidebarProps {
  collections: Collection[];
  activeCollectionId: string | null;
  onSelectCollection: (id: string | null) => void;
  figures: Figure[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  collections,
  activeCollectionId,
  onSelectCollection,
  figures,
}) => {
  // Count figures for each collection dynamically
  const getFigureCount = (collectionId: string | null) => {
    if (!collectionId) return figures.length;
    return figures.filter((fig) => {
      const ids = fig.collectionIds || [];
      return ids.some((c: any) => (typeof c === 'object' ? c._id === collectionId : c === collectionId));
    }).length;
  };

  return (
    <aside className="sidebar">
      <h3 className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={18} className="brand-accent" />
        Koleksiyonlar
      </h3>
      <ul className="filter-list">
        <li className="filter-item">
          <button
            onClick={() => onSelectCollection(null)}
            className={`filter-btn ${activeCollectionId === null ? 'active' : ''}`}
          >
            <span>Tüm Figürler</span>
            <span className="badge">{getFigureCount(null)}</span>
          </button>
        </li>
        {collections.map((col) => {
          const count = getFigureCount(col._id);
          return (
            <li className="filter-item" key={col._id}>
              <button
                onClick={() => onSelectCollection(col._id)}
                className={`filter-btn ${activeCollectionId === col._id ? 'active' : ''}`}
              >
                <span>{col.name}</span>
                <span className="badge">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default FilterSidebar;
