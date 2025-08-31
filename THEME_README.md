# Sistema de Temas - Unica System

Este documento describe la implementación del sistema de temas claro y oscuro en la aplicación Unica System.

## Características

- ✅ Tema claro y oscuro
- ✅ Detección automática del tema del sistema
- ✅ Persistencia de la preferencia del usuario
- ✅ Transiciones suaves entre temas
- ✅ Componentes UI adaptativos
- ✅ Hook personalizado para gestión de temas

## Componentes Implementados

### 1. ThemeProvider (`context/ThemeProvider.tsx`)

Wrapper del ThemeProvider de `next-themes` que configura:

- Atributo de clase para aplicar temas
- Tema por defecto (sistema)
- Habilitación de detección automática del sistema
- Deshabilitación de transiciones durante el cambio

### 2. ThemeToggle (`components/ui/theme-toggle.tsx`)

Componente de botón para cambiar entre temas:

- Iconos de sol y luna que se animan
- Dropdown con opciones: Claro, Oscuro, Sistema
- Integrado en el header de la aplicación

### 3. ThemeContext (`context/ThemeContext.tsx`)

Contexto personalizado que proporciona:

- Estado actual del tema
- Función para cambiar tema
- Tema del sistema detectado
- Estado de montaje (para evitar hidratación)

### 4. useThemeHook (`hooks/use-theme.ts`)

Hook personalizado que maneja:

- Estado de montaje para evitar errores de hidratación
- Acceso seguro a las funciones de tema
- Valores por defecto cuando no está montado

## Configuración CSS

### Variables CSS (`app/globals.css`)

El sistema utiliza variables CSS para definir colores:

```css
:root {
  /* Tema claro */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  /* ... más variables */
}

.dark {
  /* Tema oscuro */
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... más variables */
}
```

### Configuración de Tailwind (`tailwind.config.ts`)

```typescript
const config: Config = {
  darkMode: ["class"], // Habilita modo oscuro basado en clase
  // ...
};
```

## Uso

### 1. En Componentes

```tsx
import { useThemeContext } from "@/context/ThemeContext";

function MyComponent() {
  const { theme, setTheme, systemTheme, mounted } = useThemeContext();

  if (!mounted) return <div>Cargando...</div>;

  return (
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={() => setTheme("dark")}>Cambiar a oscuro</button>
    </div>
  );
}
```

### 2. Clases CSS Adaptativas

```tsx
// Estas clases se adaptan automáticamente al tema
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Texto secundario</p>
</div>
```

### 3. Componente Toggle

El toggle de tema está integrado en el header principal y permite:

- Cambiar a tema claro
- Cambiar a tema oscuro
- Usar tema del sistema

## Estructura de Archivos

```
unica-system/
├── context/
│   ├── ThemeProvider.tsx      # Provider principal
│   └── ThemeContext.tsx       # Contexto personalizado
├── components/
│   └── ui/
│       └── theme-toggle.tsx   # Componente toggle
├── hooks/
│   └── use-theme.ts          # Hook personalizado
├── app/
│   ├── globals.css           # Variables CSS
│   ├── layout.tsx            # Layout con providers
│   └── test/
│       └── page.tsx          # Página de demostración
└── tailwind.config.ts        # Configuración de Tailwind
```

## Página de Demostración

Visita `/test` para ver una demostración completa del sistema de temas que incluye:

- Información del tema actual
- Botones para cambiar tema
- Ejemplos de componentes adaptativos
- Formulario de contacto
- Tabla de ejemplo

## Dependencias

- `next-themes`: Biblioteca principal para gestión de temas
- `lucide-react`: Iconos para el toggle
- `@radix-ui/react-dropdown-menu`: Dropdown del toggle

## Consideraciones

1. **Hidratación**: El hook maneja el estado de montaje para evitar errores de hidratación
2. **Persistencia**: Las preferencias se guardan en localStorage
3. **Accesibilidad**: El toggle incluye etiquetas para lectores de pantalla
4. **Rendimiento**: Las transiciones están optimizadas para evitar parpadeos

## Próximos Pasos

- [ ] Agregar más variantes de tema (auto, sepia, etc.)
- [ ] Implementar animaciones personalizadas
- [ ] Agregar preferencias de tema por usuario
- [ ] Crear temas personalizados por organización
