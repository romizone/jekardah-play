# Polish Nasi Goreng Chef

## Perubahan
- Struktur responsif `#app > #view > #screen` dengan bar navigasi ke `/games/`, HUD DOM, overlay, dan kontrol sentuh di luar canvas.
- `fit()` mengukur ruang view, menjaga rasio canvas 320:480, dan mengatur `--u` untuk ukuran HUD/overlay. Lebar aplikasi 100%, padding termasuk dalam box sizing, kolom tombol memakai minmax(0,1fr); tidak ada elemen dengan lebar minimum yang melebihi viewport 360–1440px.
- Semua UI berbahasa Indonesia dan font sistem lokal. Tanpa library, CDN, gambar, atau font eksternal.
- Layar judul berisi cara bermain, peta tombol 1–5, P/Esc, M, Enter, dan rekor.
- State machine title/play/pause/over; satu loop requestAnimationFrame dengan accumulator fixed-step 60 Hz dan delta maksimum 100 ms.
- HUD pendapatan, waktu, kesempatan; banner instruksi saat mulai/lanjut dan tindakan; overlay jeda/akhir dengan pendapatan, jumlah tersaji/gagal, durasi, rekor, dan peringkat akhir.
- Tombol jeda dan mute; game otomatis dijeda saat tab tersembunyi atau fokus hilang.
- Kartu pelanggan terpisah dan dapat diketuk untuk mengambil bahan. Tombol 1 mengambil bahan pelanggan pertama ketika wok berisi nasi; selain itu memanggil pelanggan. Ini memperbaiki alur bahan yang sebelumnya tidak tersedia.
- Formula skor dipertahankan: pesanan cocok memberi tepat Rp 50, tanpa multiplier atau bonus. Kunci rekor tetap `jek_hi_nasi-goreng-chef`, disimpan sebagai angka dalam string localStorage.
- Wok, pelanggan, chef, bahan, meja, lampu, dan asap digambar prosedural orisinal. Latar lampu dan asap beranimasi.
- Juice: hit-stop ringan, shake kecil, partikel, teks melayang, dan getar perangkat bila tersedia. Preferensi reduced motion menonaktifkan shake, hit-stop, getar, partikel, serta animasi dekoratif.
- Pointer events pada canvas dan tombol: pointerdown/up/cancel/lostpointercapture, pointer capture, serta touch-action:none. Status pointer tombol disimpan per pointerId sehingga beberapa jari tidak saling menghapus.
- Test hook `window.__ngc`: getter state/score/lives/time/orders/wok/holding/served/muted, serta press/start/pause/mute/select/fit/hi. Tidak ada logging debug dalam game.

## Verifikasi
- `node --check engine.js`: lulus. HTML hanya memuat satu script lokal engine.js; tidak ada JavaScript inline yang perlu diperiksa terpisah.
- Uji runtime Node dengan mock DOM/canvas: title, mulai, nasi → wok → bahan → wok → saji, skor +50, freeze waktu dan input saat jeda, lanjut, mute, game over, penyimpanan rekor, dan reset sesi semuanya lulus.
- `rg -n 'http' index.html engine.js`: tidak ada hasil; tidak ada referensi eksternal.
- Uji runtime memakai mock, bukan browser nyata. Layout dan multitouch perangkat nyata belum diuji secara visual/interaktif.
- index.html, engine.js, dan laporan ini disalin ke `C:/www/jekardah/games/nasi-goreng-chef/` dan diperiksa dengan SHA-256.
- Tidak melakukan commit.
