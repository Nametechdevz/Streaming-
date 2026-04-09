# Despliegue en Hostinger Business

## PARTE 1 — Backend Node.js en Hostinger

### 1. Acceder al hPanel
- Ir a hPanel → **Node.js** (en la sección Advanced)
- Click en **"Create Application"**

### 2. Configurar la app Node.js
```
Application root: /backend
Application URL:  tudominio.com  (o subdomain: api.tudominio.com)
Application startup file: src/index.js
Node.js version: 18.x o 20.x
```

### 3. Variables de entorno en hPanel
En la sección "Environment Variables" del hPanel agregar:
```
PORT            = 3000
NODE_ENV        = production
JWT_SECRET      = una_clave_muy_larga_y_segura_aqui
JWT_EXPIRES_IN  = 7d
ADMIN_USERNAME  = admin
ADMIN_PASSWORD  = TuPasswordSeguro123!
CORS_ORIGIN     = https://tudominio.com
```

### 4. Subir archivos del backend
Via FTP (FileZilla) o Git, subir la carpeta `backend/` al directorio configurado.
NO subir node_modules/.

### 5. Instalar dependencias (SSH o Terminal de hPanel)
```bash
cd ~/backend
npm install --production
```

### 6. Iniciar la aplicación
En hPanel → Node.js → click **"Start"** o **"Restart"**

---

## PARTE 2 — Admin Panel (React estático)

### 1. Compilar localmente
```bash
cd admin-panel
REACT_APP_API_URL=https://tudominio.com/api npm run build
```

### 2. Subir archivos
Subir el contenido de `admin-panel/build/` a `public_html/admin/` via FTP

### 3. Acceder
El panel estará en: `https://tudominio.com/admin/`

---

## PARTE 3 — Subdominio recomendado (más profesional)

Crear subdominios en hPanel → Domains → Subdomains:
- `api.tudominio.com`  → apunta al backend Node.js
- `admin.tudominio.com` → apunta al panel React (public_html/admin/)

---

## Estructura de archivos en Hostinger

```
public_html/
├── admin/          ← build del React Admin Panel
└── index.html      ← (tu web principal si tienes)

backend/            ← fuera de public_html
├── src/
├── package.json
└── .env            ← con tus variables de producción
```

---

## Checklist final
- [ ] Node.js app creada en hPanel
- [ ] Variables de entorno configuradas
- [ ] Archivos del backend subidos
- [ ] npm install ejecutado
- [ ] App iniciada/corriendo
- [ ] Build del admin panel subido a public_html/admin/
- [ ] Probar login: https://tudominio.com/admin/
- [ ] Probar API: https://tudominio.com/api/health
