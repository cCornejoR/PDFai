# Guía de Fuentes - Bricolage Grotesque

Este proyecto utiliza la fuente **Bricolage Grotesque** de Google Fonts, que es una fuente variable moderna y elegante.

## Configuración

La fuente está configurada automáticamente en:

- `index.html` - Carga desde Google Fonts
- `tailwind.config.js` - Configuración de Tailwind
- `src/index.css` - Clases CSS personalizadas

## Clases disponibles

### Clases básicas de Tailwind

- `font-bricolage` - Fuente base Bricolage Grotesque
- `font-sans` - Configurado para usar Bricolage Grotesque por defecto

### Clases personalizadas con pesos específicos

- `font-bricolage-light` - Peso 300
- `font-bricolage-normal` - Peso 400 (normal)
- `font-bricolage-medium` - Peso 500
- `font-bricolage-semibold` - Peso 600
- `font-bricolage-bold` - Peso 700

## Ejemplos de uso

```jsx
// Título principal
<h1 className="text-4xl font-bricolage-bold text-slate-100">
  PDFai
</h1>

// Subtítulo
<h2 className="text-2xl font-bricolage-semibold text-slate-200">
  Sube tus documentos
</h2>

// Texto normal
<p className="font-bricolage-normal text-slate-400">
  Descripción del contenido
</p>

// Botón
<button className="font-bricolage-semibold bg-sky-600 text-white">
  Acción
</button>
```

## Características de la fuente

- **Fuente variable**: Soporta optical sizing automático
- **Rango de pesos**: 200-800
- **Optical sizing**: 12-96
- **Width variation**: Configurado en 100 (normal)

## Configuración CSS original

```css
.bricolage-grotesque {
  font-family: "Bricolage Grotesque", sans-serif;
  font-optical-sizing: auto;
  font-weight: <weight>;
  font-style: normal;
  font-variation-settings: "wdth" 100;
}
```

## Notas

- La fuente se carga automáticamente desde Google Fonts
- Todas las clases incluyen `font-optical-sizing: auto` para mejor renderizado
- El ancho está configurado en 100 (normal) por defecto
- Se incluye fallback a `sans-serif` para compatibilidad
