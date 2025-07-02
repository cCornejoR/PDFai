<p align="center">
  <img src="./src/assets/PDFai-3D.png" alt="ChatPDFai 3D Logo" width="250"/>
</p>

<h1 align="center">ChatPDFai</h1>

<p align="center">
  <strong>Chatea con tus documentos PDF utilizando el poder de la IA de Gemini.</strong>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green.svg" />
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-2.0+-FFC131?logo=tauri&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19+-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white" />
</p>

---

## 🚀 Introducción

**ChatPDFai** es una aplicación de escritorio multiplataforma construida con **Tauri 2.0** (Rust + React) que te permite interactuar con tus documentos PDF de una manera completamente nueva. Sube tus archivos, organízalos en carpetas y haz preguntas directamente a tus documentos gracias a la integración con la API de Gemini de Google.

## ✨ Características Principales

- **💬 Chat Interactivo con IA**: Haz preguntas en lenguaje natural sobre el contenido de tus PDFs usando Google Gemini.
- **📂 Organización de Archivos**: Gestiona tus documentos con un sistema de arrastrar y soltar para archivos y carpetas.
- **👁️ Visualizador de PDF Integrado**: Lee tus documentos directamente en la aplicación con un visor de PDF completo.
- **🔒 Gestión Segura de API Key**: Almacena tu API Key de Gemini de forma segura en tu equipo.
- **🎨 Interfaz Moderna**: Una interfaz de usuario limpia y moderna construida con React, TypeScript y Tailwind CSS.
- **⚡ Rendimiento Nativo**: Construida con Tauri 2.0 para un rendimiento nativo multiplataforma.
- **💾 Almacenamiento Local**: Los documentos se almacenan localmente para mayor privacidad.
- **🌙 Modo Oscuro/Claro**: Soporte completo para temas oscuros y claros con paleta macOS Sonoma/Ventura.
- **📱 Diseño Responsivo**: Interfaz completamente adaptable a diferentes tamaños de pantalla.

## 🎯 Funcionalidades Clave

### 📁 Gestión de Archivos
- **Arrastrar y Soltar**: Sube PDFs fácilmente arrastrándolos a la aplicación
- **Organización por Carpetas**: Crea y gestiona carpetas personalizadas
- **Carpetas Especiales**: Acceso rápido a archivos recientes y favoritos
- **Eliminación Segura**: Elimina archivos y carpetas con confirmación

### 💬 Chat Inteligente
- **Procesamiento de PDF**: Extrae y analiza el contenido de tus documentos
- **Preguntas Contextuales**: Haz preguntas específicas sobre el contenido
- **Respuestas Precisas**: Obtén respuestas basadas en el contenido real del PDF
- **Historial de Chat**: Mantén conversaciones continuas sobre tus documentos

### 🎨 Interfaz de Usuario
- **Diseño macOS**: Estética inspirada en macOS Sonoma/Ventura
- **TitleBar Personalizada**: Controles nativos de ventana (minimizar, cerrar)
- **Sidebar Inteligente**: Navegación fluida entre archivos y carpetas
- **Visor PDF Integrado**: Visualiza documentos sin salir de la aplicación

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Tauri 2.0 (Rust)
- **IA**: Google Gemini API
- **UI Components**: Framer Motion, Lucide React
- **PDF Processing**: PDF-lib, PDF.js
- **Drag & Drop**: @dnd-kit
- **Fonts**: Bricolage Grotesque, Aventi Bold

## 📋 Requisitos Previos

- **Node.js** 18+ 
- **Rust** 1.70+
- **Tauri CLI** 2.0+
- **API Key de Google Gemini**

## 🚀 Instalación y Desarrollo

### 1. Clonar el repositorio
```bash
git clone https://github.com/cCornejoR/PDFai.git
cd PDFai
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar API Key
- Obtén tu API Key de Google Gemini desde [Google AI Studio](https://makersuite.google.com/app/apikey)
- La aplicación te pedirá la API Key en el primer uso

### 4. Ejecutar en modo desarrollo
```bash
npm run tauri dev
```

### 5. Compilar para producción
```bash
npm run tauri build
```

## 📖 Uso

1. **Configuración Inicial**: Al abrir la aplicación por primera vez, ingresa tu API Key de Google Gemini
2. **Subir PDFs**: Arrastra y suelta archivos PDF en la aplicación o usa el botón de carga
3. **Organizar**: Crea carpetas y organiza tus documentos
4. **Chatear**: Selecciona un PDF y comienza a hacer preguntas sobre su contenido
5. **Visualizar**: Usa el visor integrado para leer tus documentos

## 🎨 Paleta de Colores

### Modo Oscuro
- **Background**: #1e1f23
- **Surface**: #404147
- **Red**: #9d3d3d
- **Coral**: #ce7c73
- **Rose**: #f9e1dd
- **Blue Gray**: #7c828d

### Modo Claro
- **Background**: #ffffff
- **Surface**: #f8f9fa
- **Accent**: #0066cc
- **Accent Hover**: #0052a3

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

- **Autor**: Cristhian Cornejo
- **GitHub**: [@cCornejoR](https://github.com/cCornejoR)
- **Proyecto**: [https://github.com/cCornejoR/PDFai](https://github.com/cCornejoR/PDFai)

---

<p align="center">
  Hecho con ❤️ usando Tauri 2.0 y React
</p>
