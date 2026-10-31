# LILA - Librería Laboral

**Web platform for occasional jobs.**

LILA es la red laboral de Bolivia diseñada para conectar talento, oportunidades y confianza. Esta plataforma web permite a los **Trabajadores** buscar empleos, gestionar sus postulaciones y su perfil, mientras que los **Empleadores** pueden crear ofertas de trabajo, visualizar reseñas y conectar con el talento local.

## 🚀 Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6 modules).
- **Backend/Architetura:** (Por definir/Implementado en la carpeta `backend/`)
- **Estilos:** Flexbox moderno, CSS Grid, con una paleta de colores personalizada (Tonos lavanda y oscuros).

## 📁 Estructura del Proyecto

El proyecto está organizado en las siguientes carpetas principales:

- `/frontend` - Todo el código relacionado con la interfaz de usuario.
  - `/assets` - CSS global y específico, JavaScript (Componentes y utilidades).
  - `/auth` - Páginas de inicio de sesión y registro.
  - `/components` - Componentes reutilizables de la interfaz (Navbar, Footer).
  - `/public` - Recursos públicos (imágenes, iconos, logotipos).
  - `/website` - Páginas específicas para los roles de `trabajador` y `empleador`.
- `/backend` - Código relacionado con el servidor, API y base de datos.
- `/docs` - Documentación del proyecto, planeamientos e historial de cambios.

## 🛠️ Cómo Iniciar el Proyecto Localmente

Para iniciar y visualizar el frontend en tu máquina local:

1. Clona este repositorio.
2. Abre la carpeta del proyecto en tu editor de código (como Visual Studio Code).
3. Utiliza una extensión de servidor local como **Live Server** para abrir los archivos HTML, de modo que las rutas absolutas (`/frontend/...`) y las importaciones de módulos ES6 funcionen correctamente.
4. Navega a `frontend/auth/login.html` para ver la página de inicio.

## 👥 Roles del Sistema

1. **Trabajador (Busco empleo):** Puede buscar trabajos, filtrar por categoría, ver detalles de las ofertas y ver su perfil.
2. **Empleador (Ofrezco empleo):** Puede publicar nuevas ofertas de trabajo, ver sus ofertas publicadas y gestionar su perfil de empresa.

## 📄 Notas para Desarrollo (Cross-Platform)
Este repositorio incluye un archivo `.gitignore` configurado específicamente para excluir los archivos generados por sistemas Windows (`Thumbs.db`, `Desktop.ini`) y Linux/Ubuntu, manteniendo el repositorio limpio en cualquier plataforma.

---
© 2026 LILA. All Rights Reserved.
