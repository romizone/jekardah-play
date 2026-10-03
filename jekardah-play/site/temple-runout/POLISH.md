# Polish Temple Runout

## Perubahan
- Judul sinematik fajar ungu–oranye–emas, judul gradien, siluet SVG candi, kabut CSS, kunang-kunang, panduan Bahasa Indonesia, dan keycap keyboard.
- Ikon SVG inline orisinal dengan gradien dan sudut membulat: artefak, hati, tas, stopwatch, jeda, suara, empat arah, piala, medali, bendera, tengkorak, dan kilat.
- HUD skor tabular, tiga slot artefak bercahaya, tiga nyawa, timer, jeda dan suara dengan label aksesibel dan fokus keyboard.
- Canvas latar cache: siluet candi jauh dan pohon beringin, koridor batu berukir, arca tepi, lampion gerbang. Lapisan dinamis: kabut parallax, obor berkedip, debu keemasan, burung sesekali dan rumput bergoyang. Latar gelap menjaga karakter terang dengan rim light tetap menonjol.
- Debu lari/tangkapan, teks +500, shake ringan, hit-stop lima tick (83,3 ms), perlindungan sementara setelah tertangkap, vignette, dan banner state berikon.
- Layar akhir gelap dengan siluet candi, efek fade/scale, statistik skor/artefak/waktu dan peringkat Penjelajah Pemula, Pemburu Artefak, atau Master Candi, serta tombol main lagi.
- Satu requestAnimationFrame, fixed-step 60 Hz accumulator dengan cap delta 100 ms; state title/play/pause/over. Listener tidak bertambah saat reset. Kehilangan fokus/tab tersembunyi otomatis menjeda.
- Pointer capture, input terpisah per pointer, pointerdown/up/cancel/lostpointercapture dan touch-action:none. Panah/WASD, P jeda, M suara, Enter mulai/lanjut.
- prefers-reduced-motion mematikan animasi CSS, shake, dan gerak latar. UI responsif tanpa dependency, CDN, font eksternal, atau raster.
- Labirin terhubung menjamin tiga artefak dapat dicapai. Formula dipertahankan: 500 per artefak + bonus 3000 saat ketiganya lengkap (4500). Kunci rekor tetap jek_hi_temple-runout, nilai angka murni.
- Hook window.__tr = {state, score, artifacts, press(), start()} memakai getter agar nilai selalu aktual, tanpa logging debug.

## Verifikasi
- node --check engine.js: LULUS.
- Jumlah literal http: index.html 0; engine.js 0.
- Mock DOM/canvas Node: LULUS mulai, empat arah, artefak +500, jeda/lanjut, collision penjaga mengurangi nyawa, tiga tangkapan → game over, rekor numerik 500, reset, seluruh artefak terjangkau, kemenangan 4500, rekor 4500, multitouch/cancel/lostpointercapture, serta loop dan draw canvas.
- Test harness berada di scratch di luar folder game; instrumentasi akses internal hanya disisipkan ke salinan kode dalam memori, bukan berkas produksi.
- Chrome headless melalui iframe berukuran 360, 768, dan 1440 px: scrollWidth sama dengan lebar viewport pada ketiganya; tidak ada overflow horizontal. Pemeriksaan visual judul, gameplay dan hasil pada 360 px; judul desktop pada 1440 px. Browser juga menjalankan hook mulai dan pengumpulan tiga artefak hingga skor 4500.
- Pemeriksaan melalui port debugging ditolak kebijakan alat; QA diselesaikan memakai Chrome headless dan iframe lokal. Belum diuji pada perangkat sentuh fisik atau audit kontras otomatis.
- index.html, engine.js dan POLISH.md disalin ke C:/www/jekardah/games/temple-runout/; SHA-256 ketiga pasangan harus identik (diverifikasi setelah penyalinan).
- Tidak melakukan commit dan tidak mengubah folder game lain.
