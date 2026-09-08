# PM Tracking - Departemen Instrument Logistic

Sistem manajemen dan pelacakan pemeliharaan preventif (*Preventive Maintenance Tracking System*) berbasis web yang dirancang khusus untuk teknisi instrumentasi logistik industri. Aplikasi ini menggabungkan sinkronisasi cloud real-time, ketahanan offline, kecerdasan buatan analitik prediktif (Google Gemini AI), dan pengalaman mobile-first.

---

## 📚 Indeks Dokumentasi Sistem

Dokumentasi lengkap sistem telah disusun ke dalam beberapa berkas Markdown terstruktur:

1. **[Fitur Aplikasi (FEATURES.md)](./FEATURES.md)**
   - Rincian lengkap seluruh fitur fungsional.
   - Manajemen Area (North, South, Dock) dan hierarki instrumen (Check Weigher, Net Weigher, Metal Detector, Routine PM).
   - Pembaruan log per instrumen dan operasi massal (*Bulk Update*).
   - Analisis prediktif AI Gemini, laporan eksekutif 1-klik, dan spesifikasi teknis.
   - Fitur mobile-first, navigasi dock bawah, dan tema gelap/terang.

2. **[Arsitektur Sistem (ARCHITECTURE.md)](./ARCHITECTURE.md)**
   - Desain arsitektur hybrid 3-tier (Client SPA, Express Backend Server, Cloud Firestore, Gemini AI).
   - Tumpukan teknologi lengkap (React 18, TypeScript, Tailwind CSS v4, Node.js, esbuild).
   - Diagram aliran data (*data flow*) untuk sinkronisasi real-time, pencatatan log, dan inferensi AI.
   - Standar keamanan, audit logistik, dan mekanisme isolasi API Key server-side.

3. **[Status Kemajuan Proyek (PROGRESS.md)](./PROGRESS.md)**
   - Matriks pencapaian setiap fase pengembangan (Fase 1 hingga Fase 5 selesai 100%).
   - Riwayat pencapaian tonggak sejarah (*Milestone 1* sampai *Milestone 28*).
   - Peta jalan pengembangan berikutnya (telemetri sensor IoT dan ekspor sertifikat audit).

4. **[Catatan Rilis & Log Perubahan (LOGS.md)](./LOGS.md) & [Dev Log (dev-log.md)](./dev-log.md)**
   - Riwayat versi lengkap dari v1.0.0 hingga rilis terbaru v2.4.0.
   - Catatan rinci setiap perubahan kode, perbaikan kontras dark mode, dan refactoring antarmuka.

---

## 🚀 Ringkasan Menjalankan Aplikasi

### Kebutuhan Sistem
- Node.js versi 18 atau yang lebih baru
- Kredensial Firebase (telah terkonfigurasi di `firebase-applet-config.json`)
- `GEMINI_API_KEY` (dikonfigurasi pada file environment `.env`)

### Perintah Pembangunan
```bash
# Menjalankan server pengembangan (Express + Vite pada port 3000)
npm run dev

# Memeriksa kepatuhan tipe TypeScript
npm run lint

# Membangun bundle produksi (Vite + esbuild server CJS bundle)
npm run build

# Menjalankan aplikasi hasil kompilasi produksi
npm run start
```

---

## 👤 Profil & Kredensial Pengembang
- **Peran**: Instrument Technician Logistics Department
- **Tanggung Jawab**: Pemeliharaan preventif, kalibrasi presisi, penjaminan kepatuhan ISO/GAMP, dan keandalan instrumen logistik secara real-time.
