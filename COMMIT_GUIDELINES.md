# 📝 Guía de Commits - PDFai

Esta guía establece las reglas y convenciones para los commits en el proyecto PDFai, siguiendo las mejores prácticas de **Conventional Commits** para desarrollo y producción.

## 🏗️ Estructura del Commit

```
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[pie(s) opcional(es)]
```

## 📋 Tipos de Commit

### **Principales (Obligatorios)**

- **`feat`**: Nueva funcionalidad para el usuario
- **`fix`**: Corrección de bugs
- **`docs`**: Solo cambios en documentación
- **`style`**: Cambios que no afectan el significado del código (espacios, formato, etc.)
- **`refactor`**: Cambio de código que no corrige bugs ni añade funcionalidades
- **`test`**: Añadir tests faltantes o corregir tests existentes
- **`chore`**: Cambios en el proceso de build o herramientas auxiliares

### **Específicos del Proyecto**

- **`ui`**: Cambios en la interfaz de usuario
- **`pdf`**: Funcionalidades relacionadas con manejo de PDFs
- **`ai`**: Mejoras o cambios en integración con Gemini AI
- **`electron`**: Cambios específicos de la aplicación Electron
- **`config`**: Cambios en configuración del proyecto

### **Para Producción**

- **`hotfix`**: Corrección urgente en producción
- **`release`**: Preparación de nueva versión
- **`deploy`**: Cambios relacionados con despliegue

## 🔧 Ámbitos Sugeridos

- **`core`**: Funcionalidad principal
- **`auth`**: Autenticación
- **`storage`**: Sistema de almacenamiento
- **`chat`**: Sistema de chat con IA
- **`viewer`**: Visor de PDFs
- **`sidebar`**: Barra lateral
- **`titlebar`**: Barra de título
- **`api`**: APIs y servicios externos
- **`build`**: Sistema de construcción
- **`deps`**: Dependencias

## ✅ Ejemplos Correctos

```bash
# Nuevas funcionalidades
feat(chat): agregar soporte para múltiples PDFs simultaneos
feat(ui): implementar tema oscuro en toda la aplicación
feat(pdf): añadir función de búsqueda en texto del PDF

# Correcciones
fix(viewer): corregir error de renderizado en PDFs grandes
fix(storage): resolver problema de pérdida de datos al cerrar app
hotfix(ai): corregir fallo en conexión con Gemini API

# Mejoras y refactoring
refactor(components): reorganizar estructura de componentes React
style(ui): mejorar espaciado y tipografía en chat panel
ui(loading): eliminar animaciones innecesarias del logo

# Documentación y configuración
docs: actualizar README con instrucciones de instalación
chore(deps): actualizar dependencias a versiones más recientes
config(electron): optimizar configuración de ventana principal

# Releases y despliegues
release: v1.0.0 - primera versión estable de PDFai
deploy(ci): configurar GitHub Actions para builds automáticos
```

## ❌ Ejemplos Incorrectos

```bash
# ❌ Muy vago
fix: arreglar bug

# ❌ Sin tipo
cambiar color del botón

# ❌ Muy largo (>50 caracteres en la descripción)
feat(ui): implementar un sistema completo de temas personalizables con soporte para modo claro, oscuro y automático basado en el sistema operativo

# ❌ Mezcla varios cambios
feat: añadir chat + fix bugs + actualizar docs
```

## 📏 Reglas de Formato

### **Descripción (línea de asunto)**

- **Máximo 50 caracteres**
- **Imperativo**: "agregar" no "agregado" o "agregando"
- **Sin punto final**
- **Primera letra en minúscula** (después del tipo)

### **Cuerpo** (opcional)

- **Línea en blanco** después de la descripción
- **Máximo 72 caracteres por línea**
- **Explicar QUÉ y POR QUÉ, no CÓMO**

### **Pie** (opcional)

- **Línea en blanco** antes del pie
- **Referencias a issues**: `Closes #123`
- **Breaking changes**: `BREAKING CHANGE: descripción`

## 🚀 Flujo de Trabajo

### **Desarrollo**

1. **Feature branches**: `feat/nueva-funcionalidad`
2. **Bugfix branches**: `fix/corregir-error`
3. **Commits frecuentes** con descripciones claras
4. **Squash merge** al main/develop

### **Producción**

1. **Hotfix branches**: `hotfix/problema-critico`
2. **Release branches**: `release/v1.2.0`
3. **Tags semánticos**: `v1.2.0`
4. **Merge directo** sin squash para mantener historial

## 🔍 Herramientas Recomendadas

- **commitizen**: Para generar commits interactivos
- **conventional-changelog**: Para generar changelogs automáticos
- **husky**: Para hooks de pre-commit
- **commitlint**: Para validar formato de commits

## 📊 Versionado Semántico

Basado en los tipos de commit:

- **MAJOR** (v1.0.0): `BREAKING CHANGE` o `feat!:`
- **MINOR** (v0.1.0): `feat:`
- **PATCH** (v0.0.1): `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

---

**📌 Recuerda**: Un buen commit es una cápsula del tiempo que cuenta la historia de tu código. ¡Haz que cada commit cuente!

_Última actualización: Enero 2025 - PDFai v1.0.0_
