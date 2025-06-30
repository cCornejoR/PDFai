# PDFai - Aplicación Electron + React

¡Bienvenido a tu nueva aplicación Electron con React! Esta aplicación combina la potencia de Electron para crear aplicaciones de escritorio multiplataforma con la flexibilidad de React para crear interfaces de usuario modernas.

## 🚀 Características

- ⚡ **Electron**: Aplicación de escritorio multiplataforma
- ⚛️ **React**: Interfaz de usuario moderna y reactiva
- 🔧 **TypeScript**: Tipado estático para mayor robustez
- 📦 **Webpack**: Bundling y hot reload
- 🎨 **CSS Moderno**: Estilos modernos con gradientes y animaciones

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn

## 🛠️ Instalación

Las dependencias ya están instaladas, pero si necesitas reinstalar:

```bash
npm install
```

## 🎯 Comandos Disponibles

### Desarrollo

```bash
npm start
```

Inicia la aplicación en modo desarrollo con hot reload.

### Construcción

```bash
npm run package
```

Genera la aplicación empaquetada para distribución.

### Crear Instaladores

```bash
npm run make
```

Crea instaladores para diferentes plataformas.

### Linting

```bash
npm run lint
```

Ejecuta ESLint para verificar la calidad del código.

## 📁 Estructura del Proyecto

```
PDFai-electron/
├── src/
│   ├── index.html          # Plantilla HTML principal
│   ├── index.ts            # Proceso principal de Electron
│   ├── renderer.tsx        # Punto de entrada del renderizador React
│   ├── App.tsx             # Componente principal de React
│   ├── index.css           # Estilos principales
│   └── preload.ts          # Script de preload
├── webpack.*.ts            # Configuraciones de Webpack
├── forge.config.ts         # Configuración de Electron Forge
├── tsconfig.json           # Configuración de TypeScript
└── package.json            # Dependencias y scripts
```

## 🎨 Personalización

### Agregar Nuevos Componentes React

1. Crea nuevos archivos `.tsx` en el directorio `src/`
2. Importa y usa los componentes en `App.tsx`

### Modificar Estilos

- Edita `src/index.css` para cambiar los estilos globales
- Agrega nuevos archivos CSS y impórtalos en tus componentes

### Configurar Electron

- Modifica `src/index.ts` para cambiar la configuración de la ventana principal
- Ajusta `forge.config.ts` para personalizar la construcción y empaquetado

## 🔧 Desarrollo de Funcionalidades PDF

Para implementar las funcionalidades de procesamiento de PDF, considera usar:

- **pdf-lib**: Para manipulación de PDFs
- **pdf2pic**: Para convertir PDFs a imágenes
- **pdf-parse**: Para extraer texto de PDFs

Ejemplo de instalación:

```bash
npm install pdf-lib pdf2pic pdf-parse
npm install --save-dev @types/pdf-parse
```

## 🌟 Próximos Pasos

1. **Implementar funcionalidades de PDF**: Agregar capacidades de lectura y procesamiento
2. **Integrar IA**: Conectar con APIs de inteligencia artificial
3. **Mejorar UI/UX**: Expandir la interfaz de usuario
4. **Agregar pruebas**: Implementar testing con Jest y React Testing Library
5. **Configurar CI/CD**: Automatizar la construcción y distribución

## 📝 Notas

- La aplicación usa React 18 con la nueva API `createRoot`
- TypeScript está configurado con JSX support
- Webpack está configurado para hot reload durante el desarrollo
- Los estilos incluyen efectos modernos como backdrop-filter y gradientes

¡Disfruta desarrollando tu aplicación PDFai! 🎉
