# 🎨 GezginFigur | 3D Sergi & Dijital Arşiv Platformu

**GezginFigur**, 3D baskı çalışmalarınızı, el boyaması minyatürlerinizi ve özel koleksiyon figürlerinizi sergilemek ve yönetmek için tasarlanmış, **cam kırılımlı (glassmorphism) koyu mod arayüze** sahip dinamik bir dijital sergi platformudur.

---

## 🚀 Canlı Yayın (Deployment)

Uygulamanın canlı ortam dağıtımı aşağıdaki servisler üzerinde yapılandırılmıştır:

*   **Frontend:** **Vercel** (Vite + React build çıktıları sıfır gecikmeyle sunulur)
*   **Backend:** **Render** (Node.js/NestJS Web Service)
*   **Veritabanı:** **MongoDB Atlas** (Bulut NoSQL Veritabanı)
*   **Medya Sunucusu:** **Cloudinary CDN** (Optimize görsel depolama ve otomatik temizleme)

---

## 🌟 Temel Özellikler

### 🖼️ Kamu Sergi Alanı (Ziyaretçi Arayüzü)
*   **Dinamik Sergi Galerisi:** Koyu mod odaklı modern grid yerleşimi.
*   **Akıllı Filtreleme:** Sol menüde her koleksiyona ait anlık figür sayılarıyla tematik süzme.
*   **Detay Modalı:** Gramaj bilgisi, stok durumu, değer/fiyat ve yüksek çözünürlüklü görsel gösterimi.

### 🛡️ Yönetim Paneli (Admin Dashboard)
*   **GitHub OAuth2:** Şifresiz, tek tıkla güvenli admin girişi.
*   **HTTP-Only JWT Cookie:** XSS saldırılarına karşı tam korumalı çerez tabanlı oturum yönetimi.
*   **Dinamik Rol Yetkilendirme:** Sadece `.env` dosyasında tanımlı `GITHUB_ADMIN_USERNAME` kullanıcısı `admin` yetkisine sahip olur; diğer tüm kullanıcılar salt okunur (`user`) moddadır.
*   **İlişkisel CRUD:** Figür, koleksiyon ve çoklu ilişki yönetimi (Mongoose Population).
*   **Filament Stok Takibi:** Renk adı, Hex önizleme kodu ve gramaj bazlı stok yönetimi.

---

## 🛠️ Teknoloji Yığını

*   **Frontend:** React 18, TypeScript, Vite, Vanilla CSS, Lucide Icons
*   **Backend:** NestJS 10, TypeScript, Mongoose ODM, Passport.js
*   **Güvenlik:** JWT, Cookie-Parser, NestJS Guards (Jwt & Admin Role Guards)

---

## 📁 Proje Yapısı

```tree
GezginFigur/
├── backend/                      # NestJS API Sunucusu
│   ├── src/
│   │   ├── auth/                 # OAuth2 & JWT Stratejileri ve Guards
│   │   ├── collections/          # Koleksiyon Modülü
│   │   ├── figures/              # Figür Modülü
│   │   ├── filament-colors/      # Filament Stok Modülü
│   │   ├── upload/               # Cloudinary Görsel Yönetim Servisi
│   │   └── users/                # Kullanıcı Modülü (Rol Belirleme)
├── frontend/                     # React + Vite Arayüzü
│   ├── src/
│   │   ├── components/           # AdminDashboard, DetailModal, Sidebar vb.
│   │   ├── context/              # AuthContext (Oturum Yönetimi)
│   │   ├── services/             # api.ts (Axios Entegrasyonu)
│   │   └── App.tsx               # Ana Görünüm Yönlendirici
└── start.sh                      # Tek tuşla sistemi yerelde başlatan script
```

---

## ⚙️ Hızlı Başlangıç (Yerel Çalıştırma)

### 1. Backend Kurulumu
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını doldurun (MongoDB, GitHub OAuth ve Cloudinary API anahtarları)
npm run start:dev
```

### 2. Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
# Arayüz http://localhost:5173 adresinde açılacaktır.
```

### 3. Kolay Başlatma (Linux)
Kök dizindeki script ile tüm servisleri otomatik başlatabilirsiniz:
```bash
chmod +x start.sh
./start.sh
```

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır.