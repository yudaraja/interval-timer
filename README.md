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
public/
  favicon.svg    Logo di tab browser
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

## Rumus dan Cara Kerja

### Variabel

| Simbol | Arti                              | Nama di kode |
| ------ | --------------------------------- | ------------ |
| P      | Waktu persiapan (detik)           | `prepare`    |
| W      | Waktu aktif per set (detik)       | `work`       |
| R      | Waktu istirahat antar set (detik) | `rest`       |
| N      | Jumlah set                        | `sets`       |

### 1. Total durasi

`Total = P + (W × N) + (R × (N − 1))`

Istirahat dihitung `N − 1` kali karena setelah set terakhir tidak ada istirahat.

Contoh: P = 5, W = 60, R = 60, N = 10
`5 + (60 × 10) + (60 × 9) = 1145 detik = 19:05`

### 2. Jumlah fase

`Jumlah fase = (P > 0 ? 1 : 0) + N + (R > 0 ? N − 1 : 0)`

Contoh dengan nilai di atas: `1 + 10 + 9 = 20 fase`.

### 3. Urutan fase

Dibuat oleh `buildPhases` di `src/useTimer.js`:

`Persiapan (jika P > 0) → Aktif set 1 → Istirahat → Aktif set 2 → ... → Aktif set N`

Fase persiapan dilewati jika P = 0. Fase istirahat dilewati jika R = 0 dan tidak ada setelah set terakhir.

### 4. Sisa waktu

Saat sebuah fase dimulai:

`waktuSelesai = Date.now() + (durasi × 1000)`

Pada setiap tick (100 ms):

`sisa (ms) = waktuSelesai − Date.now()`

Angka yang tampil: `detik = ceil(sisa / 1000)`

Waktu dihitung dari selisih jam sistem, bukan dengan mengurangi 1 detik tiap tick. Karena itu hasilnya tetap akurat walaupun tab sempat melambat.

### 5. Jeda dan lanjut

- Jeda: status berubah menjadi `paused`, nilai `sisa` tetap tersimpan.
- Lanjut: `waktuSelesai = Date.now() + sisa`

### 6. Progres lingkaran

`progres = sisa / (durasi × 1000)`

`strokeDashoffset = 1 − progres`

Lingkaran memakai `pathLength="1"` sehingga panjangnya dianggap 1. Progres 1 berarti lingkaran penuh (offset 0), progres 0 berarti kosong (offset 1).

### 7. Format waktu

`menit = floor(detik / 60)`

`detik = detik mod 60` (ditampilkan 2 digit)

Contoh: 75 detik menjadi `1:15`.

### 8. Bunyi hitung mundur

Bip dibunyikan ketika `ceil(sisa / 1000) ≤ 3`, satu kali untuk tiap detik. Detik terakhir yang sudah berbunyi disimpan di `lastTick` agar tidak berulang.

### 9. Pratinjau pola latihan

Tiap fase menjadi satu segmen dengan `flex-grow = durasi fase`, sehingga lebar segmen:

`lebar = durasi fase / total semua fase`
