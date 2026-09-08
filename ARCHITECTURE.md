# Arsitektur Sistem: PM Tracking - Departemen Instrument Logistic

Dokumen ini menjelaskan arsitektur perangkat lunak, tumpukan teknologi (tech stack), aliran data (*data flow*), keamanan, serta integrasi layanan backend dan cloud pada aplikasi **PM Tracking**.

---

## 1. Ringkasan Arsitektur Tingkat Tinggi (High-Level Architecture)

Aplikasi ini menggunakan pola **Full-Stack Hybrid (Client SPA + Express Server + Firebase Firestore + Google Gemini AI)**:

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|  React 18 + TypeScript + Vite + Tailwind CSS v4 + IndexedDB Offline     |
|  - Mobile-First Interface & Desktop Matrix Table                        |
|  - Real-Time Firestore Snapshot Listener                                |
+-----------------------+-------------------------+-----------------------+
                        |                         |
               Live Data|Sync                     |REST API (/api/ai/*)
                        v                         v
+-------------------------------+      +----------------------------------+
|          CLOUD TIER           |      |         APPLICATION TIER         |
|  Firebase Firestore (NoSQL)   |      |  Node.js + Express + TypeScript  |
|  - Collection: "equipment"    |      |  - Port 3000 (Cloud Run / Local) |
|  - Real-Time Websocket Push   |      |  - esbuild CJS Single Bundle     |
|  - Firestore Security Rules   |      |  - Vite Dev Middleware           |
+-------------------------------+      +-----------------+----------------+
                                                         |
                                                         |Server-Side SDK
                                                         v
                                       +----------------------------------+
                                       |          AI ENGINE TIER          |
                                       |  Google Gen AI (@google/genai)   |
                                       |  Model: Gemini 2.5 Flash         |
                                       |  - Structured JSON Output        |
                                       |  - Failure Mode & ISO Prediction |
                                       +----------------------------------+
```

---

## 2. Rincian Tumpukan Teknologi (Technology Stack)

| Lapisan (Layer) | Teknologi | Fungsi Utama |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 (Functional Components, Hooks) | UI reaktif, pengelolaan siklus hidup komponen, rendering performan tinggi |
| **Bahasa Pemrograman** | TypeScript 5.x | Keamanan tipe data (*strict type checking*), antarmuka kontrak data (`types.ts`) |
| **Build Tool & Bundler** | Vite 6 + esbuild | Fast Refresh instan pada masa dev dan kompilasi backend produksi yang efisien |
| **Styling & Desain** | Tailwind CSS v4 (`@import "tailwindcss"`) | Utilitas styling modern, token desain responsif, dan varian `@custom-variant dark` |
| **Ikonografi & UI Atoms** | Google Material Symbols & Lucide React | Ikon industri standar instrumentasi dan visualisasi status |
| **Server Backend** | Express.js 4.x (Node.js) | Server proxy REST API, isolasi API key rahasia, penyedia Vite middleware |
| **Penyimpanan Cloud** | Google Cloud Firestore | Database NoSQL real-time terdistribusi dengan listener `onSnapshot` |
| **Penyimpanan Lokal** | Browser IndexedDB API | Cache offline instrumen (`PMTrackingOfflineDB`) saat jaringan padam |
| **Mesin AI** | `@google/genai` (Gemini 2.5 Flash) | Pemrosesan bahasa alami prediktif, analisis failure mode, dan laporan eksekutif |

---

## 3. Struktur Direktori Proyek

```
/
├── server.ts                       # Backend Express & Integrasi Gemini AI
├── package.json                    # Konfigurasi dependensi dan skrip build/start
├── tsconfig.json                   # Konfigurasi TypeScript compiler
├── vite.config.ts                  # Konfigurasi Vite bundler
├── firestore.rules                 # Aturan keamanan database Firestore
├── firebase-applet-config.json     # Kredensial & konfigurasi proyek Firebase
├── firebase-blueprint.json         # Blueprint skema dokumen Firestore
├── index.html                      # Titik masuk HTML aplikasi
├── metadata.json                   # Metadata dan izin aplikasi
├── assets/                         # Aset gambar & ilustrasi
├── src/
│   ├── main.tsx                    # Titik masuk React DOM
│   ├── App.tsx                     # Komponen utama: state orkestrasi, layout, filter
│   ├── index.css                   # Tailwind CSS v4 & konfigurasi dark mode global
│   ├── types.ts                    # Antarmuka TypeScript (EquipmentItem, PMHistoryEntry, dll.)
│   ├── components/                 # Komponen UI modular
│   │   ├── Header.tsx              # Bilah navigasi atas desktop & kontrol tema
│   │   ├── Sidebar.tsx             # Navigasi samping area dan tautan filter
│   │   ├── BottomNavBar.tsx        # Navigasi mobile bawah (Home, North, South, Dock, History)
│   │   ├── EquipmentCard.tsx       # Kartu instrumen responsif untuk Grid View
│   │   ├── EquipmentTable.tsx      # Tabel matriks instrumen untuk Table View
│   │   ├── FilterBar.tsx           # Pencarian, filter area/status, dan dropdown sorting
│   │   ├── UpdateLogModal.tsx      # Modal form pembaruan log per instrumen
│   │   ├── BulkUpdateModal.tsx     # Modal form pembaruan batch multi-seleksi
│   │   ├── HistoryDrawer.tsx       # Drawer samping / mobile sheet riwayat alat & spesifikasi
│   │   ├── HistoryLogsView.tsx     # Tampilan halaman penuh seluruh arsip log pemeliharaan
│   │   ├── ManageAreaCustomizationModal.tsx # Modal kustomisasi dinamis Line & PM Type
│   │   ├── ReportModal.tsx         # Modal laporan eksekutif & ringkasan berbasis AI
│   │   ├── SettingsModal.tsx       # Modal preferensi tema & profil teknisi
│   │   ├── SmartAiInsights.tsx     # Widget analisis prediktif Gemini AI
│   │   └── OfflineToast.tsx        # Notifikasi status online/offline jaringan
│   ├── lib/
│   │   ├── firebase.ts             # Inisialisasi Firebase App & Firestore
│   │   ├── equipmentService.ts     # Service layer Firestore (CRUD, subscription, bulk ops)
│   │   ├── healthScore.ts          # Algoritma perhitungan indeks kesehatan instrumen
│   │   ├── indexedDb.ts            # Modul penyimpanan cache offline IndexedDB
│   │   └── dateUtils.ts            # Utilitas kalkulasi dan format tanggal
│   ├── utils/
│   │   └── haptics.ts              # Utilitas getaran haptik untuk perangkat layar sentuh
│   └── data/
│       └── initialData.ts          # Dataset awal peralatan pabrik (seeding default)
```

---

## 4. Aliran Data & Interaksi Sistem (Data Flow)

### A. Sinkronisasi Data Real-Time (Firestore Subscription)
1. Saat aplikasi dimuat, `App.tsx` memanggil `subscribeEquipment()` dari `equipmentService.ts`.
2. Firestore membuka koneksi websocket duplex (`onSnapshot`).
3. Jika koleksi masih kosong, sistem melakukan *auto-seeding* dari `INITIAL_EQUIPMENT`.
4. Setiap pembaruan (tambah log, ganti status, edit spesifikasi) memicu pembaruan instan pada seluruh klien yang terhubung tanpa perlu me-refresh halaman.
5. Snapshot yang diterima langsung disimpan ke IndexedDB browser melalui `cacheEquipmentList()` sebagai cadangan offline.

### B. Aliran Pembaruan Log Pemeliharaan
```
[User Input di Form]
       │
       ▼
[UpdateLogModal.tsx]
       │ Memvalidasi status, WO, PTW, tanggal, dan spesifikasi
       ▼
[App.tsx -> handleSaveLogData()]
       │
       ▼
[equipmentService.ts -> updateEquipmentInFirestore()]
       │ Menambahkan catatan baru ke array `history`
       │ Memperbarui status, `lastPmDate`, dan `nextDueDate`
       ▼
[Firebase Firestore Cloud Database]
       │
       ▼ (Real-time trigger onSnapshot)
[Seluruh Klien Ter-update & IndexedDB Cache Diperbarui]
```

### C. Aliran Analisis Kecerdasan Buatan (Gemini AI Engine)
```
[Komponen SmartAiInsights / ReportModal]
       │
       │ POST /api/ai/analyze-equipment
       │ Body: { equipment: {...} }
       ▼
[server.ts (Express Server Backend)]
       │
       │ Isolasi API Key: process.env.GEMINI_API_KEY
       │ Prompt Engineering: Evaluasi standar ISO/GAMP & failure mode
       ▼
[Google GenAI SDK (@google/genai) -> gemini-2.5-flash]
       │
       │ Response format: application/json
       ▼
[JSON Hasil Analisis Dikembalikan ke Frontend]
       │
       ▼
[Visualisasi Skor Risiko, Failure Mode, & Rekomendasi Teknisi di UI]
```

---

## 5. Keamanan & Kepatuhan (Security & Compliance)

1. **Isolasi API Key Server-Side**:
   - `GEMINI_API_KEY` disimpan secara aman di environment variabel backend (`server.ts`) dan **tidak pernah diekspos** ke sisi peramban (*client-side*).
2. **Aturan Keamanan Database (`firestore.rules`)**:
   - Akses Firestore dikunci dan diatur secara ketat untuk koleksi `equipment`.
3. **Audit Trail Pemeliharaan**:
   - Setiap entri pemeliharaan mencatat stempel waktu (*timestamp*), identitas teknisi, nomor Work Order (WO), dan nomor Permit To Work (PTW) untuk memenuhi standar audit integritas data industri.
4. **Validasi Tipe Data**:
   - Tipe data TypeScript yang ketat pada input dan response model untuk mencegah inkonsistensi struktur data.

---

## 6. Strategi Build & Deployment

- **Pengembangan (Dev Mode)**:
  - Perintah: `npm run dev` (`tsx server.ts`).
  - Menjalankan server Express pada port 3000 dengan Vite dev middleware yang aktif menangani HMR dan aset statis.
- **Produksi (Production Build)**:
  - Perintah: `npm run build` (`vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`).
  - Frontend dikompilasi menjadi berkas statis di folder `dist/`.
  - Backend dikompilasi menjadi berkas mandiri CommonJS `dist/server.cjs`.
- **Menjalankan di Produksi (Production Start)**:
  - Perintah: `npm run start` (`node dist/server.cjs`).
  - Mengikat host `0.0.0.0` pada port `3000` untuk kompatibilitas penuh dengan infrastruktur kontainer Cloud Run.
