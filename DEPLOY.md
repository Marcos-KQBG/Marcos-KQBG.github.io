# Publicar en GitHub Pages

Demo en **https://marcos-kqbg.github.io/** (sitio de usuario, se sirve en la raíz).
Despliegue automático con GitHub Actions: cada `push` a `main` recompila Astro y
publica. El workflow está en `.github/workflows/deploy.yml`.

## Primera vez

1. **Instalar git y GitHub CLI** (PowerShell):
   ```powershell
   winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements
   winget install --id GitHub.CLI -e --source winget --accept-package-agreements
   ```
   Cierra y abre la terminal para que se actualice el PATH.

2. **Identidad de git** (una sola vez en la máquina):
   ```powershell
   git config --global user.name "Marcos-KQBG"
   git config --global user.email "marcosblanquez9@gmail.com"
   ```

3. **Autenticar** con GitHub (abre el navegador):
   ```powershell
   gh auth login
   ```
   Elige: GitHub.com → HTTPS → "Yes" (autenticar git) → Login with a web browser.

4. **Crear el repo, activar Pages y subir**:
   ```powershell
   git init -b main
   git add -A
   git commit -m "Web El Perro Verde: primera versión"
   gh repo create Marcos-KQBG.github.io --public --source=. --remote=origin
   gh api -X POST "repos/Marcos-KQBG/Marcos-KQBG.github.io/pages" -f build_type=workflow
   git push -u origin main
   ```
   > El repo **tiene que llamarse exactamente** `Marcos-KQBG.github.io` para que
   > sea el sitio de usuario servido en la raíz.

5. Espera 1–2 min. Progreso en la pestaña **Actions** del repo. Cuando termine:
   **https://marcos-kqbg.github.io/**

Si el paso de Pages da error de "already exists", usa `-X PUT` en vez de `-X POST`.
Alternativa manual: repo → Settings → Pages → Build and deployment → Source →
"GitHub Actions".

## Cambios siguientes

```powershell
git add -A
git commit -m "..."
git push
```

Pages se actualiza solo.

## Al pasar al dominio real (perroverde.es)

Revertir los ajustes de la demo:
- `astro.config.mjs` → `site: 'https://perroverde.es'`
- `public/robots.txt` → `Sitemap: https://perroverde.es/sitemap-index.xml`
- `src/data/clinica.js` → `dominio` ya está en `https://perroverde.es` (no se tocó).
