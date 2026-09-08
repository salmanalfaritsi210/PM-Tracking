# Catatan Perubahan & Riwayat Log (LOGS.md)

Dokumen ini mencatat seluruh riwayat rilis (*release changelog*), perbaikan (*bug fixes*), peningkatan fitur (*feature enhancements*), dan log pengembangan sistem **PM Tracking - Departemen Instrument Logistic**.

---

## 1. Ringkasan Versi Rilis (Release History)

| Versi | Tanggal Rilis | Sorotan Utama Perubahan |
| :---: | :---: | :--- |
| **v2.4.0** | 15-08-2026 | Integrasi menu **Dock Area** pada bilah navigasi bawah smartphone dan penyelarasan tata letak mobile 5-tab. |
| **v2.3.0** | 10-08-2026 | Overhaul kontras tinggi **Dark Mode** (WCAG AA), standarisasi 100% bahasa Inggris, dan pembaruan profil teknisi. |
| **v2.2.0** | 10-08-2026 | Deteksi status jaringan real-time via `OfflineToast` dan penyempurnaan kartu Overdue/Due Soon di dasbor Beranda. |
| **v2.1.0** | 10-08-2026 | Transformasi desain **Mobile-First & Native-Feel** (Bottom Nav, Bottom Sheets, Haptic feedback, Pull-to-refresh). |
| **v2.0.0** | 09-08-2026 | Peluncuran **Smart Suite & Gemini AI Integration** (Health Index 0-100%, failure mode analysis, auto report summary). |
| **v1.5.0** | 09-08-2026 | Form spesifikasi teknis peralatan (load cell, bobot uji standar, rating IP, nomor seri) dan kustomisasi Area/Line dinamis. |
| **v1.2.0** | 09-08-2026 | Operasi massal (**Bulk Update Modal**) dan tombol seleksi multi-baris tabel peralatan. |
| **v1.0.0** | 09-08-2026 | Rilis inisial dengan database terdistribusi **Google Cloud Firestore** dan pelacakan status PM real-time. |

---

## 2. Rincian Log Perubahan Berdasarkan Versi

### [v2.4.0] - 2026-08-15: Mobile Dock Navigation & Ergonimics
- **Added**: Tab navigasi **Dock Area** (`precision_manufacturing`) pada bilah navigasi bawah smartphone (`BottomNavBar.tsx`).
- **Added**: Tombol aksi cepat *"Add Dock PM Log"* pada tampilan kosong area Dock.
- **Refactored**: Menghapus tombol ke-6 dari bilah bawah mobile untuk mempertahankan lebar target sentuh jempol yang optimal dan seimbang (5 tab utama: Home, North, South, Dock, History).

### [v2.3.0] - 2026-08-10: Dark Mode Contrast Overhaul & Localization
- **Fixed**: Masalah tampilan dark mode yang sebelumnya redup atau beberapa bagian masih putih terang (*light-mode bleed*).
- **Added**: Konfigurasi Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *))` di `src/index.css` dengan warna dasar industri slate `#0b132b` dan container `#131e3d`.
- **Improved**: Penyetelan kontras tinggi untuk teks judul (`#f8fafc`), teks sekunder (`#cbd5e1`), border komponen (`#23345d`), serta lencana status OK/Due/Overdue yang memenuhi rasio kontras WCAG AA.
- **Updated**: Profil dan jabatan resmi teknisi diubah menjadi: **Instrument Technician Logistics Department** ("Instrument technician responsible for maintenance, precision calibration, and real-time reliability of instrumentation across the Logistics Department").
- **Localized**: Standarisasi seluruh teks antarmuka pengguna (UI copy) ke dalam bahasa Inggris industri terpadu.

### [v2.2.0] - 2026-08-10: Network Listener & Action-Required Hub
- **Added**: Komponen `OfflineToast.tsx` yang secara otomatis mendeteksi ketika perangkat kehilangan koneksi internet (*Offline*) dan tersambung kembali (*Online & Synced*).
- **Refactored**: Restrukturisasi dasbor Beranda (Home) menjadi pusat tindakan kritis (*Action-Required Hub*) yang menampilkan kartu instrumen berstatus **Due Soon** dan ringkasan **Overdue**.

### [v2.1.0] - 2026-08-10: Mobile-First Architecture
- **Added**: Bilah navigasi bawah tetap (*fixed bottom nav*) dengan indikator pil aktif dan umpan balik haptik (`haptics.ts`).
- **Added**: Gestur sentuh tarik ke bawah (*Pull-to-refresh*) untuk memuat ulang data dengan animasi indikator.
- **Added**: Pengubahan modal desktop menjadi *Native Mobile Bottom Sheets* lengkap dengan gagang seret (*drag handle*) dan sudut membulat atas `rounded-t-3xl`.
- **Improved**: Perbesaran area klik tombol minimal 44px tinggi untuk kemudahan pengoperasian teknisi di lapangan menggunakan sarung tangan.

### [v2.0.0] - 2026-08-09: Smart Suite & Gemini AI Integration
- **Added**: Backend full-stack Node.js + Express (`server.ts`) yang berjalan pada port 3000 dengan bundle mandiri `dist/server.cjs`.
- **Added**: Endpoint `/api/ai/analyze-equipment` menggunakan model Google Gemini 2.5 Flash via `@google/genai` untuk analisis kegagalan sensor, keausan mekanis, dan kepatuhan kalibrasi ISO 9001/GAMP.
- **Added**: Algoritma penghitungan matematis `healthScore.ts` (Equipment Health Index 0-100%) dengan mitigasi penalti keterlambatan.
- **Added**: Widget asisten cerdas `SmartAiInsights.tsx` di dalam laci riwayat instrumen.
- **Added**: Generator laporan eksekutif instan 1-klik di `ReportModal.tsx`.

### [v1.5.0] - 2026-08-09: Technical Specs & Area Customization
- **Added**: Formulir spesifikasi teknis lengkap (beban uji kalibrasi, tipe sensor load cell/strain gauge, rating IP proteksi, nomor seri pabrikan, dan tanggal kalibrasi eksternal).
- **Added**: `ManageAreaCustomizationModal.tsx` yang memungkinkan teknisi menambah, mengubah, atau menghapus Lini Produksi (*Lines*) dan Tipe PM per Area secara mandiri.
- **Added**: Pengurutan hierarki prioritas instrumen: `Check Weigher` -> `Net Weigher` -> `Metal Detector` -> `Routine PM`.

### [v1.2.0] - 2026-08-09: Bulk Operations & Selection Toolbar
- **Added**: Checkbox multi-seleksi pada baris tabel peralatan dengan fitur *"Select All Page"*.
- **Added**: Bilah aksi melayang (*floating bottom action toolbar*) saat satu atau lebih instrumen dicentang.
- **Added**: `BulkUpdateModal.tsx` untuk melakukan pembaruan massal pada tanggal PM, tanggal jatuh tempo berikutnya, nomor WO, nomor PTW, dan status peralatan.

### [v1.0.0] - 2026-08-09: Initial Deployment & Cloud Integration
- **Added**: Integrasi Google Cloud Firestore dengan sinkronisasi real-time dua arah (`subscribeEquipment`).
- **Added**: Aturan keamanan `firestore.rules` untuk proteksi koleksi data `equipment`.
- **Added**: Mode tampilan ganda (Grid interaktif dan Tabel matriks data-dense).
- **Added**: Laci riwayat pemeliharaan (*History Drawer*) dengan fitur hapus log terlindungi konfirmasi.
- **Added**: Cache lokal IndexedDB (`PMTrackingOfflineDB`) sebagai redundansi saat koneksi terputus.

---

## 3. Log Pembangunan & Kompilasi Terakhir (Build Verification)
- **Linter Status**: `tsc --noEmit` lulus 100% tanpa kesalahan tipe (*0 errors*).
- **Production Bundler**: `vite build` dan `esbuild server.ts --bundle` menghasilkan berkas bersih di folder `dist/`.
- **Port Kompatibilitas**: Mengikat port 3000 (`0.0.0.0:3000`) sesuai arsitektur Google Cloud Run.
