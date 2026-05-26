import React, { useState, useRef } from 'react';
import type { Collection, Figure, FilamentColor } from '../services/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Edit, Trash, Upload, Loader2, ArrowLeft,
  FolderPlus, Image, CheckSquare, Square, Layers, Sparkles, Palette
} from 'lucide-react';

interface AdminDashboardProps {
  collections: Collection[];
  figures: Figure[];
  filamentColors: FilamentColor[];
  onRefreshData: () => Promise<void>;
  onBackToGallery: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  collections,
  figures,
  filamentColors,
  onRefreshData,
  onBackToGallery,
}) => {
  const { user, logout } = useAuth();

  // Tab management inside dashboard
  const [activeTab, setActiveTab] = useState<'figures' | 'collections' | 'filaments'>('figures');

  // Form modal/states
  const [isEditingFigure, setIsEditingFigure] = useState<boolean>(false);
  const [activeFigure, setActiveFigure] = useState<Partial<Figure> | null>(null);

  const [isEditingCollection, setIsEditingCollection] = useState<boolean>(false);
  const [activeCollection, setActiveCollection] = useState<Partial<Collection> | null>(null);

  // Filament Color states
  const [isEditingFilament, setIsEditingFilament] = useState<boolean>(false);
  const [activeFilament, setActiveFilament] = useState<Partial<FilamentColor> | null>(null);

  // Drag and Drop Uploader states
  const [uploading, setUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading indicator for submits
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ----------------------------------------------------
  // Drag & Drop Handlers
  // ----------------------------------------------------
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUploadFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Lütfen yalnızca görsel dosyaları yükleyin.');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    try {
      const response = await api.uploadImage(file);
      setActiveFigure(prev => ({
        ...prev,
        image: response.url,
        publicId: response.publicId
      }));
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Görsel yüklenemedi. Sunucunun açık olduğundan emin olun.');
    } finally {
      setUploading(false);
    }
  };

  // ----------------------------------------------------
  // Figure Action Handlers
  // ----------------------------------------------------
  const handleOpenAddFigure = () => {
    setActiveFigure({
      title: '',
      description: '',
      image: '',
      publicId: '',
      gramsUsed: 0,
      price: 0,
      stock: 0,
      collectionIds: [],
    });
    setIsEditingFigure(true);
    setErrorMessage('');
  };

  const handleOpenEditFigure = (fig: Figure) => {
    const rawIds = fig.collectionIds || [];
    const formattedIds = rawIds.map((c: any) => typeof c === 'object' ? c._id : c);

    setActiveFigure({
      _id: fig._id,
      title: fig.title,
      description: fig.description || '',
      image: fig.image || '',
      publicId: fig.publicId || '',
      gramsUsed: fig.gramsUsed || 0,
      price: fig.price || 0,
      stock: fig.stock || 0,
      collectionIds: formattedIds,
    });
    setIsEditingFigure(true);
    setErrorMessage('');
  };

  const handleDeleteFigure = async (id: string) => {
    if (!window.confirm('Bu figür sergilemesini silmek istediğinizden emin misiniz?')) return;
    try {
      await api.deleteFigure(id);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Figür silinemedi');
    }
  };

  const handleToggleCollectionInFigure = (colId: string) => {
    if (!activeFigure) return;
    const currentIds = activeFigure.collectionIds as string[] || [];
    let updatedIds: string[];

    if (currentIds.includes(colId)) {
      updatedIds = currentIds.filter(id => id !== colId);
    } else {
      updatedIds = [...currentIds, colId];
    }

    setActiveFigure({
      ...activeFigure,
      collectionIds: updatedIds,
    });
  };

  const handleSubmitFigure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFigure || !activeFigure.title) {
      setErrorMessage('Başlık alanı zorunludur.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      const payload = {
        title: activeFigure.title,
        description: activeFigure.description || '',
        image: activeFigure.image || '',
        publicId: activeFigure.publicId || '',
        gramsUsed: activeFigure.gramsUsed || 0,
        price: activeFigure.price || 0,
        stock: activeFigure.stock || 0,
        collectionIds: (activeFigure.collectionIds as string[]) || [],
      };

      if (activeFigure._id) {
        await api.updateFigure(activeFigure._id, payload);
      } else {
        await api.createFigure(payload);
      }
      setIsEditingFigure(false);
      setActiveFigure(null);
      await onRefreshData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Figür sergilemesi kaydedilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Collection Action Handlers
  // ----------------------------------------------------
  const handleOpenAddCollection = () => {
    setActiveCollection({
      name: '',
      description: '',
    });
    setIsEditingCollection(true);
    setErrorMessage('');
  };

  const handleOpenEditCollection = (col: Collection) => {
    setActiveCollection({
      _id: col._id,
      name: col.name,
      description: col.description || '',
    });
    setIsEditingCollection(true);
    setErrorMessage('');
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm('Bu koleksiyonu silmek istediğinizden emin misiniz? Bu koleksiyona ait figürlerin koleksiyon ilişkisi kaldırılacaktır.')) return;
    try {
      await api.deleteCollection(id);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Koleksiyon silinemedi');
    }
  };

  const handleSubmitCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCollection || !activeCollection.name) {
      setErrorMessage('Koleksiyon adı zorunludur.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      const payload = {
        name: activeCollection.name,
        description: activeCollection.description || '',
      };

      if (activeCollection._id) {
        await api.updateCollection(activeCollection._id, payload);
      } else {
        await api.createCollection(payload);
      }
      setIsEditingCollection(false);
      setActiveCollection(null);
      await onRefreshData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Koleksiyon kaydedilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Filament Color Action Handlers
  // ----------------------------------------------------
  const handleOpenAddFilament = () => {
    setActiveFilament({
      colorName: '',
      hexCode: '#14b8a6',
      quantity: 1,
    });
    setIsEditingFilament(true);
    setErrorMessage('');
  };

  const handleOpenEditFilament = (fc: FilamentColor) => {
    setActiveFilament({
      _id: fc._id,
      colorName: fc.colorName,
      hexCode: fc.hexCode || '#14b8a6',
      quantity: fc.quantity,
    });
    setIsEditingFilament(true);
    setErrorMessage('');
  };

  const handleDeleteFilament = async (id: string) => {
    if (!window.confirm('Bu filament rengini silmek istediğinizden emin misiniz?')) return;
    try {
      await api.deleteFilamentColor(id);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Filament rengi silinemedi');
    }
  };

  const handleSubmitFilament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFilament || !activeFilament.colorName) {
      setErrorMessage('Renk adı alanı zorunludur.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      const payload = {
        colorName: activeFilament.colorName,
        hexCode: activeFilament.hexCode || '',
        quantity: activeFilament.quantity || 0,
      };

      if (activeFilament._id) {
        await api.updateFilamentColor(activeFilament._id, payload);
      } else {
        await api.createFilamentColor(payload);
      }
      setIsEditingFilament(false);
      setActiveFilament(null);
      await onRefreshData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Filament rengi kaydedilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper mapper to show names inside the listing tables
  const getCollectionNamesString = (fig: Figure): string => {
    const ids = fig.collectionIds || [];
    return ids.map((c: any) => {
      if (typeof c === 'object' && c !== null) return c.name;
      const matched = collections.find(col => col._id === c);
      return matched ? matched.name : '';
    }).filter(Boolean).join(', ') || 'Atanmamış';
  };

  return (
    <div className="admin-layout animate-slide-up">
      {/* Admin Title & Profile Header */}
      <header className="admin-header">
        <div>
          <button onClick={onBackToGallery} className="btn btn-secondary btn-sm" style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} />
            Sergi Galerisine Dön
          </button>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles className="brand-accent" size={28} />
            Yönetici Kontrol Paneli
          </h2>
          <p>Tekrar hoş geldiniz, Yönetici <strong>{user?.username}</strong></p>
        </div>
        <button onClick={logout} className="btn btn-danger btn-sm">
          Güvenli Çıkış
        </button>
      </header>

      {/* Stats Counter Boxes */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Image size={24} />
          </div>
          <div>
            <div className="stat-number">{figures.length}</div>
            <div className="stat-label">Toplam Sergi Figürü</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--secondary)', backgroundColor: 'var(--secondary-glow)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-number">{collections.length}</div>
            <div className="stat-label">Tematik Koleksiyon</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' }}>
            <Palette size={24} />
          </div>
          <div>
            <div className="stat-number">{filamentColors.length}</div>
            <div className="stat-label">Filament Rengi</div>
          </div>
        </div>
      </section>

      {/* Navigation Switch Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--card-border)', gap: '4px' }}>
        <button
          onClick={() => { setActiveTab('figures'); setIsEditingFigure(false); setIsEditingCollection(false); }}
          className={`filter-btn ${activeTab === 'figures' ? 'active' : ''}`}
          style={{ width: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          Figürleri Yönet
        </button>
        <button
          onClick={() => { setActiveTab('collections'); setIsEditingFigure(false); setIsEditingCollection(false); setIsEditingFilament(false); }}
          className={`filter-btn ${activeTab === 'collections' ? 'active' : ''}`}
          style={{ width: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          Koleksiyonları Yönet
        </button>
        <button
          onClick={() => { setActiveTab('filaments'); setIsEditingFigure(false); setIsEditingCollection(false); setIsEditingFilament(false); }}
          className={`filter-btn ${activeTab === 'filaments' ? 'active' : ''}`}
          style={{ width: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          Filament Renkleri
        </button>
      </div>

      {/* Action Panels */}
      {!isEditingFigure && !isEditingCollection && !isEditingFilament && (
        <div className="admin-panel animate-fade-in">
          {activeTab === 'figures' ? (
            <>
              <div className="panel-header">
                <h3>Vitrindeki Figürler</h3>
                <button onClick={handleOpenAddFigure} className="btn btn-primary btn-sm">
                  <Plus size={16} />
                  Figür Ekle
                </button>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Görsel</th>
                      <th>Başlık</th>
                      <th>Koleksiyonlar</th>
                      <th>Detay</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {figures.map(fig => (
                      <tr key={fig._id}>
                        <td>
                          <img
                            src={fig.image || 'https://images.unsplash.com/photo-1563089145-599997674d42?w=80'}
                            alt={fig.title}
                            className="table-thumb"
                          />
                        </td>
                        <td style={{ fontWeight: 600 }}>{fig.title}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{getCollectionNamesString(fig)}</td>
                        <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {fig.gramsUsed ? `${fig.gramsUsed}g` : '—'} / {fig.price ? `$${fig.price}` : '—'} / {fig.stock !== undefined ? `${fig.stock} adet` : '—'}
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button onClick={() => handleOpenEditFigure(fig)} className="btn btn-secondary btn-sm" aria-label="Figürü düzenle">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteFigure(fig._id)} className="btn btn-secondary btn-sm btn-danger" aria-label="Figürü sil">
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {figures.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                          Henüz figür oluşturulmadı. Başlamak için "Figür Ekle" butonuna tıklayın!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : activeTab === 'filaments' ? (
            <>
              <div className="panel-header">
                <h3>Filament Renk Stoku</h3>
                <button onClick={handleOpenAddFilament} className="btn btn-primary btn-sm">
                  <Plus size={16} />
                  Filament Rengi Ekle
                </button>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Renk</th>
                      <th>Renk Adı</th>
                      <th>Miktar (adet)</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filamentColors.map(fc => (
                      <tr key={fc._id}>
                        <td>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--border-radius-sm)',
                            backgroundColor: fc.hexCode || 'var(--card-border)',
                            border: '1px solid var(--card-border)',
                          }} />
                        </td>
                        <td style={{ fontWeight: 600 }}>{fc.colorName}</td>
                        <td style={{ fontWeight: 600 }}>{fc.quantity}</td>
                        <td>
                          <div className="actions-cell">
                            <button onClick={() => handleOpenEditFilament(fc)} className="btn btn-secondary btn-sm" aria-label="Filament rengini düzenle">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteFilament(fc._id)} className="btn btn-secondary btn-sm btn-danger" aria-label="Filament rengini sil">
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filamentColors.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>
                          Henüz filament rengi eklenmedi. Başlamak için "Filament Rengi Ekle" butonuna tıklayın!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="panel-header">
                <h3>Mevcut Koleksiyonlar</h3>
                <button onClick={handleOpenAddCollection} className="btn btn-primary btn-sm">
                  <FolderPlus size={16} />
                  Koleksiyon Ekle
                </button>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Koleksiyon Adı</th>
                      <th>Açıklama</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map(col => (
                      <tr key={col._id}>
                        <td style={{ fontWeight: 600 }}>{col.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{col.description || 'Açıklama belirtilmemiş.'}</td>
                        <td>
                          <div className="actions-cell">
                            <button onClick={() => handleOpenEditCollection(col)} className="btn btn-secondary btn-sm" aria-label="Koleksiyonu düzenle">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteCollection(col._id)} className="btn btn-secondary btn-sm btn-danger" aria-label="Koleksiyonu sil">
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {collections.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '32px' }}>
                          Henüz koleksiyon oluşturulmadı. Başlamak için "Koleksiyon Ekle" butonuna tıklayın!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Figures CRUD Form Page */}
      {isEditingFigure && activeFigure && (
        <div className="admin-panel animate-slide-up">
          <h3>{activeFigure._id ? 'Figür Sergilemesini Düzenle' : 'Yeni Figür Sergilemesi Oluştur'}</h3>
          <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
            Aşağıdaki bilgileri doldurun. Görseller güvenli bir şekilde bulut depolama servisine yüklenir.
          </p>

          {errorMessage && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmitFigure}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* Left Column: Image Drag Drop */}
              <div>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Sergilenecek Görsel
                </label>
                <div
                  className={`dropzone ${dragActive ? 'active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  {uploading ? (
                    <>
                      <Loader2 className="dropzone-icon animate-spin" />
                      <p>Görsel Yükleniyor...</p>
                    </>
                  ) : activeFigure.image ? (
                    <>
                      <img src={activeFigure.image} alt="Preview" className="dropzone-preview" />
                      <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Değiştirmek için tıklayın veya görsel sürükleyin</p>
                    </>
                  ) : (
                    <>
                      <Upload className="dropzone-icon" />
                      <p style={{ fontWeight: 600 }}>Sürükle bırak veya bilgisayarından seç</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG, JPG veya WEBP (Maks 10MB)</p>
                    </>
                  )}
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Veya özel bir Görsel URL'si yapıştırın</label>
                  <input
                    type="text"
                    className="form-input"
                    value={activeFigure.image || ''}
                    onChange={(e) => setActiveFigure({ ...activeFigure, image: e.target.value })}
                    placeholder="https://ornek.com/gorsel.png"
                  />
                </div>
              </div>

              {/* Right Column: Title, Description, Checkbox Collections */}
              <div>
                <div className="form-group">
                  <label className="form-label">Figür Başlığı *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={activeFigure.title || ''}
                    onChange={(e) => setActiveFigure({ ...activeFigure, title: e.target.value })}
                    placeholder="Figür başlığını girin..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Açıklama / Hikaye</label>
                  <textarea
                    className="form-input form-textarea"
                    value={activeFigure.description || ''}
                    onChange={(e) => setActiveFigure({ ...activeFigure, description: e.target.value })}
                    placeholder="3D çalışmanızı, kullandığınız malzemeleri, renkleri, ölçeği vb. açıklayın..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kullanılan Filament (gram)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={activeFigure.gramsUsed ?? 0}
                    onChange={(e) => setActiveFigure({ ...activeFigure, gramsUsed: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{ maxWidth: '200px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fiyat (TL)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={activeFigure.price ?? 0}
                    onChange={(e) => setActiveFigure({ ...activeFigure, price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    style={{ maxWidth: '200px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stok (adet)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={activeFigure.stock ?? 0}
                    onChange={(e) => setActiveFigure({ ...activeFigure, stock: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{ maxWidth: '200px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ait Olduğu Koleksiyonlar</label>
                  <div className="checkbox-group">
                    {collections.map(col => {
                      const isChecked = (activeFigure.collectionIds as string[] || []).includes(col._id);
                      return (
                        <label key={col._id} className="checkbox-label" onClick={() => handleToggleCollectionInFigure(col._id)}>
                          {isChecked ? (
                            <CheckSquare size={16} className="brand-accent" />
                          ) : (
                            <Square size={16} style={{ color: 'var(--card-border)' }} />
                          )}
                          <span>{col.name}</span>
                        </label>
                      );
                    })}
                    {collections.length === 0 && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Henüz kullanılabilir koleksiyon yok. Önce bu figürü kaydedin, ardından koleksiyon oluşturun!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button
                type="button"
                onClick={() => setIsEditingFigure(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Kaydediliyor...
                  </>
                ) : 'Figür Sergilemesini Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filament Colors CRUD Form Page */}
      {isEditingFilament && activeFilament && (
        <div className="admin-panel animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3>{activeFilament._id ? 'Filament Rengini Düzenle' : 'Yeni Filament Rengi Ekle'}</h3>
          <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
            Filament renklerinizin stok miktarını takip edin.
          </p>

          {errorMessage && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmitFilament}>
            <div className="form-group">
              <label className="form-label">Renk Adı *</label>
              <input
                type="text"
                className="form-input"
                value={activeFilament.colorName || ''}
                onChange={(e) => setActiveFilament({ ...activeFilament, colorName: e.target.value })}
                placeholder="Örn. Turkuaz Mavisi, Koyu Kırmızı..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Renk Kodu (Hex)</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={activeFilament.hexCode || '#14b8a6'}
                  onChange={(e) => setActiveFilament({ ...activeFilament, hexCode: e.target.value })}
                  style={{ width: '48px', height: '48px', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', border: 'none', padding: 0, background: 'none' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={activeFilament.hexCode || ''}
                  onChange={(e) => setActiveFilament({ ...activeFilament, hexCode: e.target.value })}
                  placeholder="#14b8a6"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Miktar (adet)</label>
              <input
                type="number"
                className="form-input"
                value={activeFilament.quantity ?? 0}
                onChange={(e) => setActiveFilament({ ...activeFilament, quantity: parseInt(e.target.value) || 0 })}
                min="0"
                style={{ maxWidth: '200px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button
                type="button"
                onClick={() => setIsEditingFilament(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Kaydediliyor...
                  </>
                ) : 'Filament Rengini Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Collections CRUD Form Page */}
      {isEditingCollection && activeCollection && (
        <div className="admin-panel animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3>{activeCollection._id ? 'Tematik Koleksiyonu Düzenle' : 'Yeni Tematik Koleksiyon Oluştur'}</h3>
          <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
            Koleksiyonlar, figürlerinizi genel galeri görünümündeki filtrelerde organize eder.
          </p>

          {errorMessage && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmitCollection}>
            <div className="form-group">
              <label className="form-label">Koleksiyon Adı *</label>
              <input
                type="text"
                className="form-input"
                value={activeCollection.name || ''}
                onChange={(e) => setActiveCollection({ ...activeCollection, name: e.target.value })}
                placeholder="Örn. Minyatürler, El Boyaması Figürler, Bilim Kurgu..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kısa Açıklama</label>
              <textarea
                className="form-input form-textarea"
                value={activeCollection.description || ''}
                onChange={(e) => setActiveCollection({ ...activeCollection, description: e.target.value })}
                placeholder="Bu tematik koleksiyona ne tür figürlerin girdiğini açıklayın..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button
                type="button"
                onClick={() => setIsEditingCollection(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Kaydediliyor...
                  </>
                ) : 'Tematik Koleksiyonu Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
