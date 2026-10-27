# Interval Timer

Timer interval untuk olahraga seperti lompat tali, HIIT, atau latihan sirkuit. Atur durasi aktif, istirahat, dan jumlah set, lalu mulai. Berjalan sepenuhnya di browser tanpa backend.

## Fitur

- Atur waktu persiapan, aktif, istirahat, dan jumlah set
- Pratinjau pola latihan dan total durasi secara langsung
- Layar latihan berganti warna per fase agar mudah dibaca dari jauh
- Bunyi bip di 3 detik terakhir dan saat pindah fase, plus getar di perangkat yang mendukung
- Jeda, lanjut, lewati fase, dan berhenti
- Layar tetap menyala selama timer berjalan
- Pengaturan terakhir tersimpan otomatis di browser
- Hitungan waktu memakai jam sistem sehingga tetap akurat

## Teknologi

React 18 dan Vite 5.

## Menjalankan

```bash
npm install
npm run dev
```

Build untuk produksi:

```bash
npm run build
npm run preview
```

## Deploy ke Vercel

1. Push project ke GitHub.
2. Import repository di [Vercel](https://vercel.com/new).
3. Preset Vite terdeteksi otomatis. Klik Deploy.

## Struktur

```
src/
  App.jsx        Tampilan: pengaturan, latihan, dan selesai
  useTimer.js    Logika timer dan urutan fase
  sound.js       Bunyi dan getar
  index.css      Gaya
```

## Penyesuaian

- Langkah dan batas tiap pengaturan: `FIELDS` di `src/App.jsx`
- Nilai awal: `DEFAULTS` di `src/App.jsx`
- Nama fase: `PHASE_LABEL` di `src/App.jsx`
- Warna fase: variabel `--work`, `--rest`, dan `--prepare` di `src/index.css`
