# TalentUp - Plataforma de Conexión para Desarrolladores y Empresas

Una plataforma web moderna que conecta desarrolladores talentosos con empresas que buscan contratar, facilitando el proceso de reclutamiento y networking en el sector tecnológico.

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Librería de interfaz de usuario moderna y eficiente
- **TypeScript** - Tipado estático para mayor robustez del código
- **Vite** - Herramienta de construcción y desarrollo ultrarrápida
- **Tailwind CSS** - Framework de CSS utility-first para diseño responsivo
- **shadcn/ui** - Componentes UI accesibles y personalizables
- **React Router DOM** - Navegación del lado del cliente
- **React Hook Form** - Manejo eficiente de formularios
- **Lucide React** - Iconografía moderna y consistente

### Backend as a Service (BaaS)
- **Supabase** - Base de datos PostgreSQL, autenticación, y almacenamiento

### Herramientas de Desarrollo
- **ESLint** - Linter para mantener calidad de código
- **Bun** - Runtime y gestor de paquetes rápido
- **Lovable** - Plataforma de desarrollo asistida por IA

## 🚀 Cómo ejecutar el proyecto

### Prerrequisitos
- Node.js 18+ y npm (o Bun recomendado)
- Git

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/rlovece/talentup.git
   cd talentup
   ```

2. **Instalar dependencias**
   ```bash
   # Con npm
   npm install
   
   # O con Bun (recomendado)
   bun install
   ```

3. **Configurar variables de entorno**
   ```bash
   # El proyecto ya incluye la configuración de Supabase
   # No se requiere configuración adicional para desarrollo
   ```

4. **Ejecutar el servidor de desarrollo**
   ```bash
   # Con npm
   npm run dev
   
   # O con Bun
   bun run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:8080
   ```

### Scripts disponibles
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la construcción de producción
- `npm run lint` - Ejecuta el linter de código

## 🎯 Justificación del BaaS elegido: Supabase

### ¿Por qué Supabase?

**1. Base de datos PostgreSQL robusta**
- PostgreSQL es una base de datos relacional madura y potente
- Soporte completo para consultas complejas y relaciones
- Escalabilidad empresarial desde el primer día

**2. Autenticación integrada y segura**
- Sistema de autenticación completo con múltiples proveedores
- Row Level Security (RLS) para control granular de acceso
- Gestión automática de tokens JWT y sesiones

**3. API automática y tipado TypeScript**
- Generación automática de APIs REST y GraphQL
- Tipos TypeScript generados automáticamente desde el esquema
- Actualizaciones en tiempo real con suscripciones

**4. Almacenamiento de archivos integrado**
- Storage nativo para CVs, avatares y logos de empresa
- Políticas de acceso granulares
- CDN global para entrega rápida de contenido

**5. Edge Functions para lógica personalizada**
- Funciones serverless en el edge para mejor rendimiento
- Integración perfecta con el ecosistema Supabase
- Ejemplo: función para actualización segura de emails

**6. Ecosistema y herramientas de desarrollo**
- Dashboard web intuitivo para gestión de datos
- CLI potente para migraciones y desarrollo local
- Excelente documentación y comunidad activa

**7. Escalabilidad y costo**
- Plan gratuito generoso para desarrollo y proyectos pequeños
- Escalabilidad automática sin configuración compleja
- Pricing transparente y predecible

## 📁 Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base de shadcn/ui
│   └── ...             # Componentes específicos de la app
├── pages/              # Páginas de la aplicación
├── contexts/           # Contextos de React
├── hooks/              # Hooks personalizados
├── lib/                # Utilidades y configuraciones
├── integrations/       # Integraciones con servicios externos
│   └── supabase/       # Cliente y tipos de Supabase
└── config/             # Archivos de configuración
```

