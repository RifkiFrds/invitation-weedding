# Manual Book — Generator Link Undangan

Folder ini berisi manual book PDF & script auto-build screenshot untuk halaman `/generator`.

## File

- **`Manual-Generator-Link-Undangan.pdf`** — Manual book siap baca / cetak.
- **`screenshots/`** — Screenshot generator (auto-generated).
- **`manual.html`** — Sumber HTML manual book.
- **`build-manual.js`** — Script Node.js untuk auto-generate screenshot & PDF.

## Regenerate PDF

Jika ada perubahan tampilan generator, jalankan ulang:

```bash
cd docs
npm install
npx playwright install chromium
node build-manual.js
```

Output: `Manual-Generator-Link-Undangan.pdf` akan diperbarui otomatis.
