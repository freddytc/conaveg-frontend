# CONAVEG - Sistema de Gestión Empresarial

Sistema integral de gestión para CONAVEG que incluye administración de usuarios, empleados, inventario, proyectos, asistencias y recursos humanos con interfaz moderna y responsive.

## 🚀 Características Principales

- **🔐 Sistema de Autenticación**: Login seguro con roles diferenciados
- **👥 Gestión de Usuarios**: Administración completa de usuarios del sistema
- **👔 Recursos Humanos**: Gestión de empleados y control de asistencias con GPS
- **📊 Dashboard Inteligente**: Panel de control con estadísticas en tiempo real
- **🏗️ Gestión de Proyectos**: Control y seguimiento completo de proyectos
- **📦 Inventario**: Gestión de equipos, stock y alertas automáticas
- **📋 Asignaciones**: Asignación de empleados a proyectos con seguimiento
- **🧾 Facturas y Proveedores**: Gestión financiera integrada
- **📱 Registro de Asistencias**: Con geolocalización y múltiples métodos
- **🎨 Interfaz Moderna**: Diseño responsive con tema oscuro/claro

## 📋 Prerrequisitos

- **Node.js** (versión 16 o superior recomendada)
- **npm** o **yarn**
- **Backend CONAVEG** ejecutándose en puerto 8080

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd conaveg-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   REACT_APP_API_URL=http://localhost:8080/conaveg/api
   REACT_APP_APP_NAME=CONAVEG
   ```

4. **Iniciar la aplicación**
   ```bash
   npm start
   ```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

## 🏗️ Estructura del Proyecto

```
src/
├── components/           # Componentes React organizados por módulo
│   ├── auth/            # Autenticación (Login con validación)
│   ├── common/          # Componentes reutilizables (Layout, Toast, Modals)
│   ├── dashboard/       # Dashboard con estadísticas dinámicas
│   ├── employees/       # Gestión completa de empleados
│   ├── users/           # Administración de usuarios y roles
│   ├── inventory/       # Control de inventario y equipos
│   ├── projects/        # Gestión de proyectos y seguimiento
│   ├── assignments/     # Asignaciones empleado-proyecto
│   ├── attendance/      # Control de asistencias con GPS
│   ├── invoices/        # Gestión de facturas
│   ├── suppliers/       # Administración de proveedores
│   ├── movements/       # Movimientos de inventario
│   └── styles/          # Archivos CSS y temas
├── services/            # Servicios para comunicación con API
├── hooks/               # Hooks personalizados (useAuth, useNotification)
└── App.js               # Componente principal con enrutamiento
```

## 👥 Roles y Permisos

### 👑 Administrador (ADMIN/ADMINISTRADOR)
- **Acceso completo** al sistema
- Gestión de usuarios y roles
- Todas las funcionalidades disponibles
- Dashboard completo con todas las estadísticas

### ⭐ Gerente (GERENTE)
- Gestión de empleados y proyectos
- Acceso a inventario y reportes
- Control de asistencias
- Dashboard con estadísticas limitadas

### 👨‍💼 Empleado (EMPLEADO)
- Registro de asistencias
- Consulta de inventario (solo lectura)
- Vista limitada de proyectos asignados
- Dashboard básico

## 🎨 Tecnologías y Librerías

### Frontend Core
- **React 18** - Framework principal
- **React Router v6** - Navegación SPA
- **Bootstrap 4** - Framework CSS responsive

### UI/UX
- **Font Awesome 5** - Iconografía completa
- **SweetAlert** - Alertas y notificaciones elegantes
- **Animate.css** - Animaciones suaves
- **CSS Custom Properties** - Temas dinámicos

### Funcionalidades
- **Geolocation API** - Para registro de asistencias con ubicación
- **LocalStorage** - Persistencia de sesión
- **Axios** - Cliente HTTP con interceptores
- **Date/Time handling** - Manejo de fechas y horarios

## 📱 Funcionalidades Destacadas

### ✅ Control de Asistencias
- **Registro por GPS** con obtención automática de ubicación
- **Múltiples métodos**: Manual, Tarjeta, Biométrico
- **Validación de horarios** y detección de duplicados
- **Historial completo** con filtros avanzados

### 📊 Dashboard Inteligente
- **Estadísticas en tiempo real** de usuarios, empleados y proyectos
- **Permisos dinámicos** según rol del usuario
- **Indicadores visuales** con iconos y colores
- **Accesos rápidos** contextuales

### 📦 Gestión de Inventario
- **Control de stock** con alertas automáticas
- **Categorización** de equipos y materiales
- **Historial de movimientos** completo
- **Estados personalizables** (Disponible, En uso, Mantenimiento)

### 🏗️ Proyectos Avanzados
- **Seguimiento de progreso** con barras visuales
- **Asignación de empleados** con roles específicos
- **Estados configurables** y fechas de entrega
- **Dashboard de proyectos** con métricas

## 📚 Scripts Disponibles

### Desarrollo
```bash
npm start          # Servidor de desarrollo (puerto 3000)
npm test           # Ejecutar pruebas
npm run test:watch # Pruebas en modo watch
```

### Producción
```bash
npm run build      # Construir para producción
npm run serve      # Servir build de producción
```

### Utilidades
```bash
npm run eject      # ⚠️ Exponer configuración (irreversible)
npm run analyze    # Analizar bundle de producción
```

## 🔧 Configuración Avanzada

### Variables de Entorno

| Variable | Descripción | Valor por defecto | Requerida |
|----------|-------------|-------------------|-----------|
| `REACT_APP_API_URL` | URL del backend API | `http://localhost:8080/conaveg/api` | ✅ |
| `REACT_APP_APP_NAME` | Nombre de la aplicación | `CONAVEG` | ❌ |
| `REACT_APP_VERSION` | Versión de la app | `1.0.0` | ❌ |

### Personalización de Temas

Los archivos de estilo principales incluyen:
- `DarkTheme.css` - Tema oscuro principal
- `Login.css` - Estilos del sistema de autenticación
- `Sidebar.css` - Navegación lateral responsive
- `Toast.css` - Notificaciones personalizadas

## 🚀 Despliegue

### Desarrollo Local
```bash
npm start
# Aplicación disponible en http://localhost:3000
```

### Producción
```bash
# Construir aplicación
npm run build

# Servir con servidor estático
npm install -g serve
serve -s build -l 3000
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🐛 Solución de Problemas Comunes

### 🔴 Error de conexión con backend
```bash
# Verificar que el backend esté ejecutándose
curl http://localhost:8080/conaveg/api/health

# Revisar variable de entorno
echo $REACT_APP_API_URL
```

### 🔴 Problemas de autenticación
```bash
# Limpiar almacenamiento local
localStorage.clear()

# Verificar token en Developer Tools > Application > Local Storage
```

### 🔴 Geolocalización no funciona
- Verificar permisos del navegador para ubicación
- Usar HTTPS en producción (requerido para geolocalización)
- Revisar configuración de navegador

### 🔴 Estilos no se cargan
```bash
# Limpiar caché de npm
npm run build -- --reset-cache

# Limpiar caché del navegador
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

## 🧪 Testing

```bash
# Ejecutar todas las pruebas
npm test

# Pruebas con cobertura
npm test -- --coverage

# Pruebas específicas
npm test -- --testNamePattern="Login"
```

## 📈 Optimizaciones de Rendimiento

- **Code Splitting** automático por rutas
- **Lazy Loading** de componentes pesados
- **Memoización** de componentes con React.memo
- **Optimización de imágenes** y assets
- **Service Worker** para caché (en build de producción)

## 🤝 Contribución

1. **Fork** el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear **Pull Request**

### Convenciones de Código
- Usar **ES6+** y hooks de React
- Seguir **nomenclatura camelCase**
- Comentar código complejo
- Mantener componentes pequeños y reutilizables

## 📄 Licencia

Este proyecto es propiedad de **CONAVEG**. Todos los derechos reservados.

---

## 📞 Soporte

Para soporte técnico o reportar bugs:
- **Email**: soporte@conaveg.com
- **Documentación**: [Consultar wiki del proyecto]

---

**📌 Nota Importante**: Este frontend requiere el backend de CONAVEG ejecutándose. Consulta la documentación del backend para instrucciones completas de instalación y configuración de la API.