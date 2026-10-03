# Gobak Sodor — Kampung Wijilan

Selesai 3 Oktober 2026. Game baru terdiri dari `index.html` dan `engine.js`, tanpa dependensi. Keduanya disalin identik ke `C:/www/jekardah/games/gobak-sodor/`. Tidak ada commit atau perubahan pada game lain. Perubahan nasi-goreng-chef yang sudah ada sebelum pekerjaan ini dibiarkan.

## Implementasi

- Canvas 540 × 660; `fit()` menggunakan ukuran `#view`, membatasi `#screen` pada ruang tersedia, dan mengatur `--u`. Struktur `#app > #view > #screen`, HUD DOM, overlay, dan kontrol sentuh. Kartu overlay dapat digulir pada layar pendek.
- UI Indonesia, tautan `/games/`, tombol suara/jeda, judul, petunjuk, rekor, dan statistik akhir dengan empat peringkat yang ditentukan berdasarkan crossing sukses.
- Satu crossing sukses dihitung setelah pelari mencapai garis atas lalu pulang ke bawah. Skor setiap crossing = 100 + maksimum(0, lantai(25 − durasi perjalanan dalam detik)). Setiap crossing menaikkan gelombang. Penjaga bergerak horizontal, makin cepat, kemudian bertambah hingga lima baris dan penjaga tambahan pada gelombang 6.
- Tiga nyawa; tertangkap mengurangi satu nyawa dan respawn di bawah dengan perlindungan sementara. Indikator berkedip dan cincin menandai perlindungan.
- Joystick pointer dengan satu pointer pemilik; pointer kedua tidak merebut kontrol. Menangani pointerdown/move/up/cancel/lostpointercapture. `touch-action:none`. Arrow/WASD, P, M, Enter; input dibersihkan saat pergantian state. Blur/halaman tersembunyi menjeda permainan.
- requestAnimationFrame, accumulator langkah tetap 60 Hz, delta maksimum 100 ms, state title/play/pause/over.
- Sawah, bale-bale, lampion, pegunungan, awan senja, kunang-kunang, serta karakter digambar dari geometri prosedural orisinal. Debu, hit-stop 100 ms, screen shake, teks skor melayang, banner, dan nada Web Audio lokal.
- Rekor pada `jek_hi_gobak-sodor` berupa angka murni; kegagalan akses storage tidak menghentikan permainan.
- Hook publik `window.__gs`: getter state/score/lives/wave, `press(dir)` dan `start()`. `press(null)` melepas input. Tidak ada logging debug dalam berkas game.

## Verifikasi akhir

`node --check engine.js`: **LULUS**, exit 0.

`grep -c 'http' index.html engine.js`:

```text
index.html:0
engine.js:0
```

Exit 1 dari grep berarti tidak ada kecocokan, sesuai hasil yang diminta.

Uji runtime dijalankan di Node v26.7.0 dengan `vm`, mock DOM/canvas, localStorage, dan antrean requestAnimationFrame. Salinan kode di memori diinstrumentasi untuk menempatkan penjaga secara deterministik; tidak ada hook tambahan pada kode produksi. Harness sementara dihapus setelah pengujian.

**LULUS:** judul → mulai; gerak kiri/kanan/atas/bawah; perjalanan nyata ke atas lalu kembali menggunakan input dan frame loop; skor dan bonus waktu bertambah; gelombang naik; tiga tabrakan nyata mengurangi nyawa 3 → 2 → 1 → 0; game over dan statistik; rekor numerik tersimpan; reset ke skor 0/gelombang 1/nyawa 3. Lulus juga multi-touch, pelepasan pointer asing, pointercancel, lostpointercapture, jeda/lanjut, blur, batas accumulator 100 ms, serta fit pada lebar 360/390/768/1024/1440 px.

Verifikasi ukuran memakai mock geometry dan pemeriksaan CSS; rendering visual pada browser/perangkat fisik belum diuji.

## Kesamaan salinan (SHA-256)

| Berkas | Hash sumber dan tujuan |
| --- | --- |
| index.html | `21E71FBD10DB22D6A22D160105CD7F25DE0DECF04CB48CD92ECA4C427D659E2B` |
| engine.js | `146AC213B305E29CB21BB1A054E4D1CAD7C98E584DFF498476279F7FEF3E483D` |

## Aset Sinematik

Ditambahkan 3 Oktober 2026 menggunakan built-in image generation. Gambar orisinal AI bergaya fotorealistik, terinspirasi suasana Wijilan; bukan dokumentasi foto lokasi. Seluruh aset lokal dalam `aset/`, JPG 1600 × 900, encoder kualitas 82, tanpa base64 atau URL eksternal.

| Aset | Ukuran |
| --- | ---: |
| hero-judul.jpg | 296.41 KB |
| latar-lapangan.jpg | 265.48 KB |
| latar-malam.jpg | 274.98 KB |
| **Total** | **836.86 KB (856947 byte; KB = 1024 byte)** |

Prompt set: semua memakai `photorealistic-natural`, cinematic landscape 16:9, tekstur Indonesia realistis, tanpa teks/logo/watermark. Hero: kampung Wijilan Yogyakarta, rumah Jawa beratap genteng, jalan kecil, lampion menyala, sawah, siluet Merapi, golden hour dengan kabut atmosfer dan ruang judul. Lapangan: lapangan rumput gobak sodor dilihat dari jauh, garis kapur samar, rumah Jawa dan lampion di tepi, sawah dan Merapi, golden hour dusk tanpa orang dekat kamera. Malam: warung Jawa dengan atap genteng, bangku kayu dan lampion hangat, jalan kampung, sawah serta siluet Merapi di bawah langit indigo.

Judul menggunakan preload lokal; seluruh gambar menggunakan Image(), decoding async, loading lazy, dan pemeriksaan decode/naturalWidth sebelum digunakan. Aset sekunder dimuat saat idle dengan timeout 1500 ms. Overlay judul/game over memakai img object-fit cover serta gradasi gelap. Kegagalan load/decode mempertahankan gradasi dan pemandangan prosedural. Kartu teks memiliki latar gelap 245/255 opaque; rasio kontras teks terendah 9.17:1 bahkan dengan foto putih di belakang dan tanpa memperhitungkan overlay, melebihi 4.5:1.

Canvas: drawImage cover dengan overscan, blur 1.5px, brightness 0.65, parallax sinus ±4px; prefers-reduced-motion menonaktifkan parallax. Pemandangan geometri tetap digambar sebagai foreground tipis; lapangan aktif, karakter, garis, collision, HUD dan efek tetap prosedural/utuh. Jika aset gagal, foreground kembali opaque seperti sebelumnya.

Verifikasi: node --check engine.js lulus. Harness Node VM lulus untuk load/decode berhasil, judul menampilkan img, canvas drawImage, mulai gameplay, serta seluruh gambar gagal (fallback dan gameplay berjalan). Pemeriksaan source tidak menemukan URL eksternal/base64. Verifikasi runtime memakai mock DOM/canvas; rendering browser fisik belum diuji. Salinan index.html, engine.js dan ketiga aset diverifikasi SHA-256 identik di C:/www/jekardah/games/gobak-sodor/. Tidak ada commit. Hash tabel sebelumnya merupakan versi sebelum aset sinematik.
