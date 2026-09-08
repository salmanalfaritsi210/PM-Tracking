# Dokumentasi Fitur Aplikasi: PM Tracking - Departemen Instrument Logistic

Aplikasi **PM Tracking (Preventive Maintenance Tracking System)** dirancang khusus untuk departemen instrumentasi logistik industri guna memantau, menjadwalkan, mendokumentasikan, dan memprediksi perawatan peralatan penimbangan, deteksi logam, serta instrumen logistik secara real-time.

---

## Daftar Isi
1. [Manajemen Area & Peralatan (Area & Equipment Matrix)](#1-manajemen-area--peralatan)
2. [Siklus Status & Prioritas Pemeliharaan](#2-siklus-status--prioritas-pemeliharaan)
3. [Pembaruan Log & Operasi Massal (Bulk Operations)](#3-pembaruan-log--operasi-massal)
4. [Timeline & Audit Log Pemeliharaan](#4-timeline--audit-log-pemeliharaan)
5. [Spesifikasi Teknis & Kustomisasi Area Dinamis](#5-spesifikasi-teknis--kustomisasi-area-dinamis)
6. [Smart Suite & Gemini AI Maintenance Intelligence](#6-smart-suite--gemini-ai-maintenance-intelligence)
7. [Pengalaman Mobile-First & Performa Lapangan](#7-pengalaman-mobile-first--performa-lapangan)
8. [Mode Offline & Penyimpanan Lokal (IndexedDB)](#8-mode-offline--penyimpanan-lokal)
9. [Tema Tampilan (Light & Dark Mode) & Profil Teknisi](#9-tema-tampilan--profil-teknisi)

---

## 1. Manajemen Area & Peralatan

Sistem mendukung struktur hierarki lokasi pabrik/gudang logistik yang terbagi menjadi beberapa area operasional:

- **North Logistics**: Area operasional logistik utara dengan berbagai line produksi (Line 1, Line 2, dll.) yang dilengkapi Check Weigher, Metal Detector, dan motor conveyor.
- **South Logistics**: Area logistik selatan dengan lini konveyor dan penimbangan berkapasitas tinggi (Line A, Line B, Line C).
- **Dock Area**: Area dermaga/penerimaan logistik dengan pemantauan unit penimbangan serta instrumen handling.
- **Hierarki Pengurutan Tipe PM**: Secara otomatis memprioritaskan urutan instrumen kritis:
  1. `Check Weigher` (Instrumen timbangan otomatis inline)
  2. `Net Weigher` (Instrumen penimbangan bobot bersih)
  3. `Metal Detector` (Detektor kontaminan logam kritis)
  4. `Routine PM` (Perawatan rutin mekanikal/elektrikal terencana)
- **Mode Tampilan Ganda (Grid vs Table)**:
  - **Grid View**: Kartu visual interaktif dengan visualisasi Health Index, status badge, tombol aksi cepat, dan countdown tenggat waktu.
  - **Table View**: Tampilan tabular data-dense untuk monitoring puluhan instrumen sekaligus lengkap dengan filter multi-kolom dan checkbox seleksi massal.

---

## 2. Siklus Status & Prioritas Pemeliharaan

Setiap instrumen dievaluasi secara otomatis berdasarkan tanggal perawatan terakhir (`lastPmDate`) dan tenggat waktu jatuh tempo berikutnya (`nextDueDate`):

| Status | Warna Indikator | Definisi & Logika Bisnis |
| :--- | :--- | :--- |
| **OK** | Hijau Emerald | Peralatan dalam kondisi prima, waktu pemeliharaan berikutnya masih aman (> 7 hari ke depan). |
| **Due Soon** | Kuning / Amber | Pemeliharaan jatuh tempo dalam rentang ≤ 7 hari ke depan. Memerlukan persiapan Work Order (WO) dan Permit to Work (PTW). |
| **Overdue** | Merah Crimson | Melewati batas waktu jatuh tempo tanpa pembaruan log pemeliharaan. Berisiko terhadap kepatuhan kalibrasi ISO & akurasi alat. |

- **Dasbor Beranda (Home / Action-Required Hub)**:
  - Menampilkan ringkasan instrumen yang memerlukan tindakan segera (**Due Soon** dan **Overdue**).
  - Menghindarkan teknisi dari kejenuhan informasi (*alert fatigue*) dengan memprioritaskan hanya alat yang kritis di halaman utama.

---

## 3. Pembaruan Log & Operasi Massal

### A. Single Equipment Log Update (`UpdateLogModal.tsx`)
- Form pembaruan komprehensif untuk memasukkan:
  - **Status PM Terkini** (OK / Due Soon / Overdue).
  - **Tanggal PM Terakhir & Tanggal Due Berikutnya** (otomatis kalkulasi interval siklus).
  - **Nomor Work Order (WO) & Nomor Permit to Work (PTW)** untuk audit logistik.
  - **Nama Teknisi & Catatan Teknis** (kondisi sensor, load cell, belt cleaner, dll.).
  - **Edit Nama & Kode Lokasi Instrumen** (contoh: `SL-NW-042`).
  - **Input Spesifikasi Teknis** (bobot uji standar, jenis sensor, rating proteksi IP).

### B. Bulk Multi-Select & Batch Update (`BulkUpdateModal.tsx`)
- Seleksi instrumen secara massal melalui checkbox pada tabel atau opsi *"Select All"*.
- **Floating Toolbar**: Muncul otomatis ketika satu atau beberapa instrumen dipilih.
- **Aksi Massal**:
  - Update status serentak untuk seluruh line.
  - Penjadwalan tanggal PM & Due Date massal (misal: saat *plant turnaround* / *shutdown maintenance*).
  - Penulisan nomor WO/PTW bersamaan untuk efisiensi administrasi tim teknisi.

---

## 4. Timeline & Audit Log Pemeliharaan

- **Equipment History Drawer (`HistoryDrawer.tsx`)**:
  - Panel samping (pada desktop) atau *Native Bottom Sheet* (pada mobile) yang menampilkan riwayat lengkap perawatan peralatan yang dipilih.
  - Menampilkan rekam jejak historis: tanggal, teknisi pelaksana, nomor WO/PTW, status saat itu, dan catatan pemeliharaan.
  - **Fitur Hapus Log dengan Konfirmasi**: Memungkinkan teknisi menghapus entri log yang salah input dengan dialog konfirmasi pencegahan data hilang.
  - **Tab Spesifikasi Terintegrasi**: Akses cepat spesifikasi alat, nomor seri, kalibrasi eksternal terakhir, dan parameter sensor.
- **Tampilan Khusus Riwayat (`HistoryLogsView.tsx`)**:
  - Halaman penuh untuk melihat seluruh catatan log pemeliharaan dari semua instrumen dan area.
  - Pencarian fleksibel berdasarkan nama alat, kode tag, nomor WO, atau nama teknisi.

---

## 5. Spesifikasi Teknis & Kustomisasi Area Dinamis

- **Manajemen Kustomisasi Area (`ManageAreaCustomizationModal.tsx`)**:
  - Penambahan, pengeditan, atau penghapusan lini produksi (Line) secara dinamis tanpa perlu mengubah kode sumber.
  - Kustomisasi tipe-tipe PM yang berlaku untuk setiap area spesifik (misal: North vs South Logistics).
- **Spesifikasi Teknis Instrumen Lengkap**:
  - **Standard Test Weights**: Beban uji kalibrasi rutin (misal: 500g, 1000g, 20kg F1 class).
  - **Sensor Type**: Jenis load cell, digital strain gauge, optical sensor, atau inductive coil.
  - **IP Protection Rating**: Sertifikasi ketahanan debu & air (misal: IP65, IP67 washdown).
  - **Nomor Seri & Kalibrasi Eksternal**: Nomor seri pabrikan dan tanggal kalibrasi laboratorium terakreditasi KAN / ISO 17025.

---

## 6. Smart Suite & Gemini AI Maintenance Intelligence

Aplikasi dilengkapi dengan integrasi server-side **Google Gemini AI (`gemini-2.5-flash`)** melalui `@google/genai`:

- **Algoritma Skor Kesehatan Prediktif (Equipment Health Index 0 - 100%)**:
  - Dihitung secara matematis berdasarkan ketepatan jadwal PM, frekuensi keterlambatan, interval kalibrasi, dan histori anomali.
  - Dikelompokkan ke dalam kategori risiko: *Low Risk (80-100%)*, *Medium Risk (60-79%)*, *High Risk (40-59%)*, dan *Critical Risk (<40%)*.
- **Asisten Diagnostik AI (`SmartAiInsights.tsx`)**:
  - Menjalankan analisis prediktif berbasis AI terhadap kondisi instrumen.
  - Mengidentifikasi potensi **Failure Modes** (mode kegagalan, seperti drift beban uji, keausan mekanis konveyor, interferensi elektromagnetik).
  - Memberikan langkah-langkah rekomendasi teknisi (*Technician Action Steps*) yang terstruktur.
  - Menyediakan panduan kepatuhan kalibrasi berstandar ISO 9001 / GAMP.
- **Generator Laporan Ringkasan Eksekutif Otomatis (`ReportModal.tsx`)**:
  - Pembuatan ringkasan eksekutif 1-klik untuk Department Head dan Manajemen Pabrik.
  - Mengkalkulasi metrik kesehatan armada instrumen secara agregat (% OK, % Due Soon, % Overdue) dan menyusun narasi strategi alokasi sumber daya teknisi.
  - Tampilan cetak siap ekspor / PDF-friendly.

---

## 7. Pengalaman Mobile-First & Performa Lapangan

Didesain khusus untuk teknisi yang bertugas langsung di lantai gudang/pabrik menggunakan smartphone atau tablet industri:

- **Bilah Navigasi Bawah (Bottom Navigation Bar)**: Akses instan dengan satu jempol ke 5 area utama:
  - **Home**: Daftar instrumen yang memerlukan aksi segera (Due Soon & Overdue).
  - **North**: Seluruh instrumen di North Logistics.
  - **South**: Seluruh instrumen di South Logistics.
  - **Dock**: Seluruh instrumen di Dock Logistics.
  - **History**: Arsip rekam jejak pemeliharaan seluruh pabrik.
- **Native Bottom Sheets**: Form input dan riwayat alat terbuka dari bawah dengan drag-handle khas aplikasi mobile native.
- **Target Sentuh Ergonomis**: Seluruh tombol dan kontrol memiliki ukuran minimal 44px dengan efek transisi tekan aktif (*active press scale*).
- **Respon Haptik (Haptic Feedback)**: Umpan balik getaran ringan saat navigasi tab atau interaksi tombol penting.
- **Pull-to-Refresh**: Tarik ke bawah pada perangkat sentuh untuk memperbarui data secara cepat.

---

## 8. Mode Offline & Penyimpanan Lokal (IndexedDB)

- **Sinkronisasi Otomatis IndexedDB (`indexedDb.ts`)**:
  - Seluruh snapshot data instrumen dari Firebase Firestore secara otomatis di-cache ke dalam IndexedDB browser.
  - Jika teknisi berada di area gudang dengan sinyal lemah/blank spot (*dead zone*), data terakhir tetap dapat dibuka dan dibaca tanpa layar blank.
- **Toast Status Jaringan Real-Time (`OfflineToast.tsx`)**:
  - Memberikan notifikasi visual halus saat koneksi internet terputus (*Offline Mode*) dan saat koneksi kembali pulih (*Back Online & Synced*).

---

## 9. Tema Tampilan & Profil Teknisi

- **High-Contrast Dark Mode (Mode Gelap)**:
  - Palet warna slate gelap yang ramah mata untuk penggunaan di area pencahayaan rendah atau shift malam.
  - Kontras teks tinggi bersertifikasi WCAG AA, memastikan teks putih/terang terbaca jelas tanpa silau.
  - Pemilihan tema otomatis mendeteksi preferensi sistem dan disimpan di `localStorage`.
- **Clean Light Mode (Mode Terang)**:
  - Skema warna terang profesional dengan aksen warna industrial blue (`#094cb2`).
- **Identitas & Kredensial Teknisi (`SettingsModal.tsx`)**:
  - Memuat profil pengembang dan jabatan resmi: **Instrument Technician Logistics Department**.
  - Rincian deskripsi tanggung jawab pemeliharaan, kalibrasi presisi, dan keandalan operasional instrumen secara real-time.
