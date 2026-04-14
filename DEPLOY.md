# MotorSur — Guía de deploy y apps
## Paso a paso completo

---

## ═══════════════════════════════
## PARTE 1 — SUBIR A LA WEB (Vercel)
## ═══════════════════════════════

### PASO 1 — Crear cuenta en Vercel
1. Ir a https://vercel.com
2. Clic en "Sign Up"
3. Recomendado: registrarse con GitHub (lo vas a necesitar después)
4. Si no tenés GitHub, crealo gratis en https://github.com

---

### PASO 2 — Subir el proyecto (Opción A — sin GitHub, más rápido)

1. Una vez logueado en Vercel, ir a https://vercel.com/new
2. Clic en **"Browse"** o arrastrá la carpeta `motorsur-web` completa
3. Vercel detecta automáticamente que es un sitio estático
4. En "Project Name" escribí: `motorsur`
5. Clic en **"Deploy"**
6. En 30 segundos tenés: `https://motorsur.vercel.app`

---

### PASO 3 — Subir el proyecto (Opción B — con GitHub, recomendada)

1. Crear repositorio en https://github.com/new
   - Nombre: `motorsur`
   - Privado ✓
   - Clic "Create repository"

2. Subir los archivos:
   - En la página del repo: "uploading an existing file"
   - Arrastrá todos los archivos de la carpeta `motorsur-web`
   - Clic "Commit changes"

3. En Vercel → New Project → Import Git Repository
   - Seleccionar el repo `motorsur`
   - Deploy

**Ventaja:** Cada vez que actualizás un archivo en GitHub, Vercel se actualiza solo en segundos.

---

### PASO 4 — Actualizar la URL en Supabase

Una vez que tengas la URL de Vercel, ir a:
**Supabase → Authentication → URL Configuration**

Agregar:
- **Site URL:** `https://motorsur.vercel.app`
- **Redirect URLs:** `https://motorsur.vercel.app/**`

Esto es necesario para que el login por email funcione correctamente.

---

### PASO 5 — Dominio propio (motorsur.com.ar)

**Registrar el dominio:**
- NIC Argentina: https://nic.ar (para .com.ar — más barato)
- Alternativa: https://namecheap.com (para .com)
- Precio .com.ar: ~$500 ARS/año

**Conectar con Vercel:**
1. Vercel → tu proyecto → Settings → Domains
2. Clic "Add Domain" → escribir `motorsur.com.ar`
3. Vercel te da dos registros DNS. En NIC.ar:
   - Tipo A → apuntar a la IP que da Vercel
   - O tipo CNAME → `cname.vercel-dns.com`
4. HTTPS se activa automáticamente

**Actualizar en Supabase:** cambiar Site URL a `https://motorsur.com.ar`

---

### PASO 6 — Actualizar APP_URL en Edge Functions

En Supabase → Settings → Edge Functions → Secrets:
```
APP_URL = https://motorsur.com.ar
```

---

## ═══════════════════════════════
## PARTE 2 — APP ANDROID (Google Play)
## ═══════════════════════════════

### ¿El HTML sirve para armar las apps?
✅ SÍ — el archivo actual ya tiene todo lo necesario:
- PWA completa (manifest, service worker)
- Responsive para móvil
- Notificaciones push
- Instalable desde Chrome

Solo necesitás que esté en una URL pública con HTTPS (Vercel).

---

### Opción A — PWA (sin stores, más rápido)

Ya está implementada. Una vez en Vercel con HTTPS:
- **Android:** Chrome muestra "Instalar app" automáticamente
- **iOS:** Safari → Compartir → Agregar a pantalla de inicio

**Limitaciones:** No aparece en Google Play ni App Store.

---

### Opción B — Google Play con TWA (recomendada para Android)

TWA (Trusted Web Activity) convierte tu URL en una app real de Android.

**Costo:** $25 USD una sola vez (cuenta de Google Play Developer)

**Herramienta:** https://bubblewrap.glitch.me (sin código)

**Paso a paso:**
1. Ir a https://bubblewrap.glitch.me
2. Pegar tu URL: `https://motorsur.com.ar`
3. Completar los datos:
   - App name: MotorSur
   - Package name: `com.motorsur.app`
   - Version: 1.0.0
4. Descargar el APK generado
5. Crear cuenta en https://play.google.com/console ($25 USD)
6. Nueva app → Subir el APK → Completar la ficha
7. Revisión de Google: 1-3 días hábiles

**Requisito importante:**
Agregar este archivo en tu web para verificar la relación:
Crear `/public/.well-known/assetlinks.json` con el contenido que
genera Bubblewrap automáticamente.

---

### Opción C — App nativa con Capacitor (Android + iOS juntos)

Capacitor convierte tu HTML en una app nativa real.

**Instalación (necesitás Node.js):**
```bash
# Instalar Node.js desde nodejs.org

# En una carpeta nueva:
npm init -y
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

npx cap init MotorSur com.motorsur.app --web-dir public

# Android
npx cap add android
npx cap copy android
npx cap open android   # Abre Android Studio

# iOS (solo en Mac)
npx cap add ios
npx cap copy ios
npx cap open ios       # Abre Xcode
```

**Android Studio** (gratis): https://developer.android.com/studio
**Xcode** (gratis, solo Mac): desde la App Store de Mac

---

## ═══════════════════════════════
## PARTE 3 — APP iOS (App Store)
## ═══════════════════════════════

**Requisito:** necesitás una Mac para compilar apps iOS.

**Costo:** $99 USD/año (Apple Developer Program)

**Opciones si no tenés Mac:**

1. **PWA en Safari** — ya funciona, se instala desde "Agregar a inicio"
   - Limitación: no tiene acceso a notificaciones push nativas en iOS 16 o anterior
   - iOS 17+ ya soporta push notifications en PWA ✅

2. **MacInCloud** ($20/mes) — Mac virtual en la nube para compilar

3. **Servicio de compilación** — empresas que compilan por vos por ~$50

**Si tenés Mac, con Capacitor:**
```bash
npx cap open ios
# En Xcode: Product → Archive → Distribute App → App Store
```

---

## ═══════════════════════════════
## RESUMEN — Orden recomendado
## ═══════════════════════════════

```
SEMANA 1:
  □ 1. Subir a Vercel (30 min)
  □ 2. Actualizar URLs en Supabase (5 min)
  □ 3. Registrar motorsur.com.ar (10 min)
  □ 4. Conectar dominio en Vercel (10 min)
  □ 5. Activar Edge Functions con APP_URL real
  □ 6. Configurar MercadoPago (ahora que tenés URL)

SEMANA 2:
  □ 7. Cuenta Google Play ($25)
  □ 8. Generar APK con Bubblewrap
  □ 9. Publicar en Google Play

SEMANA 3 (si querés iOS):
  □ 10. Apple Developer Program ($99/año)
  □ 11. Compilar con Capacitor o MacInCloud
  □ 12. Publicar en App Store
```

---

## Estructura de archivos entregados

```
motorsur-web/
├── vercel.json          ← Configuración de Vercel
└── public/
    ├── index.html       ← Aplicación principal (v12)
    ├── sw.js            ← Service Worker para PWA
    └── seguimiento.html ← Página de respuesta al email de seguimiento
```
