# LMS Page Translation Patch

Patch ini menambahkan fitur page translation berbasis URL locale dengan `next-intl` untuk App Router.

## Isi utama

- `/id/login`, `/en/login`, `/zh/login`
- Middleware locale-aware yang tetap menjaga proteksi route `/student`, `/professor`, dan `/admin`
- `LanguageSwitcher` untuk pindah bahasa tanpa menghilangkan path/query saat ini
- Struktur final `app/[locale]/...` agar tidak muncul 404 saat membuka `/en`
- File pesan `messages/id.json`, `messages/en.json`, `messages/zh.json`
- `next.config.ts` sudah dibungkus plugin `next-intl`

## Instalasi

1. Install dependency:

```bash
npm install next-intl
```

2. Backup folder/file lama:

```bash
cp -r app app.backup
cp -r components components.backup
cp middleware.ts middleware.backup.ts
cp next.config.ts next.config.backup.ts 2>/dev/null || true
```

3. Copy isi patch ke root project.

4. Jika project sudah punya `next.config.ts`, jangan langsung timpa. Gabungkan bagian berikut:

```ts
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
export default withNextIntl(nextConfig);
```

5. Restart server:

```bash
npm run dev
```

6. Test URL:

- http://localhost:3000/id/login
- http://localhost:3000/en/login
- http://localhost:3000/zh/login
- http://localhost:3000/professor/dashboard harus redirect ke /id/login jika belum login

## Catatan

String yang sudah dibuat multi-bahasa: Login, Register, Sidebar, metadata, dan language switcher.
Halaman dashboard/detail tetap berjalan pada route locale. Untuk menerjemahkan semua teks spesifik di dashboard/detail, pindahkan string hardcoded ke file `messages/*.json` dan panggil dengan `useTranslations()`.


## Catatan khusus Next.js 16

Project ini menggunakan Next.js 16.x, jadi file request interceptor harus bernama `proxy.ts`, bukan `middleware.ts`.

Jika sebelumnya masih ada `middleware.ts` di root project, hapus atau rename menjadi backup agar tidak membingungkan. Gunakan `proxy.ts` dari patch ini.

Pastikan `next-intl` tersimpan di `dependencies`, bukan hanya muncul sebagai `extraneous`:

```bash
npm install next-intl@latest --save
```

Lalu jalankan ulang development server:

```bash
npm run dev
```

Test URL:

```txt
http://localhost:3000/id/login
http://localhost:3000/en/login
http://localhost:3000/zh/login
```
