# Setup — Fix ENOSPC / "next is not recognized"

## Why this happens

1. **`ENOSPC`** — Your disk (usually `C:`) ran out of space during `npm install`, so dependencies were **not** installed.
2. **`next is not recognized`** — `node_modules` is missing or incomplete because install failed.

## Step 1: Free disk space (required)

Target **at least 2–3 GB free** on the drive where npm writes (often `C:`).

- Run **Disk Cleanup** (Windows → search "Disk Cleanup")
- Empty **Recycle Bin**
- Remove old `node_modules` folders on other projects
- Clear Downloads / temp files
- Uninstall unused apps

Clear npm cache (can free 500MB–2GB):

```powershell
npm cache clean --force
```

Optional — remove global cache folder:

```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache" -ErrorAction SilentlyContinue
```

## Step 2: Use D: drive for npm cache

This project includes `.npmrc` pointing cache to:

`D:\xampp\htdocs\lawrato\.npm-cache`

Ensure **D:** has enough free space too.

Set globally (optional):

```powershell
npm config set cache "D:\xampp\htdocs\lawrato\.npm-cache"
```

## Step 3: Install again

```powershell
cd D:\xampp\htdocs\lawrato\platform
npm install
npm run dev
```

Open **http://localhost:3000**

## If install still fails

Try installing only production deps first:

```powershell
npm install --no-optional
```

Or use the **static HTML site** (no Node/npm needed):

**http://localhost/lawrato/index.html** (XAMPP Apache)

## Verify install worked

```powershell
dir node_modules\.bin\next.cmd
```

If that file exists, `npm run dev` should work.
