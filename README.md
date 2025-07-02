# CONAVEG - Sistema de Gestión Empresarial

Sistema integral de gestión para CONAVEG que incluye administración de usuarios, empleados, inventario, proyectos y recursos humanos.

## 🚀 Características

- **Gestión de Usuarios**: Sistema de autenticación con roles (Admin, Gerente, Empleado)
- **Recursos Humanos**: Administración de empleados y asistencias
- **Gestión de Proyectos**: Control y seguimiento de proyectos
- **Inventario**: Gestión de equipos y stock
- **Asignaciones**: Asignación de empleados a proyectos
- **Facturas y Proveedores**: Gestión financiera básica

## 📋 Prerrequisitos

- Node.js (versión 14 o superior)
- npm o yarn
- Backend CONAVEG ejecutándose

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
   ```bash
   # Crear archivo .env en la raíz del proyecto
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
├── components/           # Componentes React
│   ├── auth/            # Autenticación (Login)
│   ├── common/          # Componentes compartidos (Layout, Header, Sidebar)
│   ├── dashboard/       # Dashboard principal
│   ├── employees/       # Gestión de empleados
│   ├── users/           # Gestión de usuarios
│   ├── inventory/       # Gestión de inventario
│   ├── projects/        # Gestión de proyectos
│   └── styles/          # Archivos CSS
├── services/            # Servicios para API calls
├── utils/              # Utilidades y helpers
└── App.js              # Componente principal
```

## 👥 Roles de Usuario

### Administrador (ADMIN)
- Acceso completo al sistema
- Gestión de usuarios
- Todas las funcionalidades disponibles

### Gerente (GERENTE)
- Gestión de empleados y proyectos
- Acceso a inventario y reportes
- Sin acceso a gestión de usuarios

### Empleado (EMPLEADO)
- Acceso limitado a inventario y proyectos
- Consulta de información básica

## 🎨 Tecnologías Utilizadas

- **React 18** - Framework principal
- **Bootstrap 4** - Framework CSS
- **Font Awesome** - Iconografía
- **Axios** - Cliente HTTP
- **React Router** - Navegación

## 📚 Scripts Disponibles

### `npm start`
Ejecuta la aplicación en modo desarrollo.
Abre [http://localhost:3000](http://localhost:3000) en el navegador.

### `npm test`
Ejecuta las pruebas en modo interactivo.

### `npm run build`
Construye la aplicación para producción en la carpeta `build/`.
Optimiza y minifica los archivos para mejor rendimiento.

### `npm run eject`
**⚠️ Operación irreversible** - Expone la configuración de webpack y scripts.

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `REACT_APP_API_URL` | URL del backend API | `http://localhost:8080/conaveg/api` |
| `REACT_APP_APP_NAME` | Nombre de la aplicación | `CONAVEG` |

### Tema y Estilos

La aplicación utiliza un tema oscuro personalizado. Los archivos de estilo principales son:
- `DarkTheme.css` - Tema global oscuro
- `Login.css` - Estilos del formulario de login
- `Sidebar.css` - Estilos de la barra lateral

## 🚀 Despliegue

### Desarrollo
```bash
npm start
```

### Producción
```bash
npm run build
npm install -g serve
serve -s build
```

### Docker (Opcional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Solución de Problemas

### Error de conexión con el backend
- Verificar que el backend esté ejecutándose
- Revisar la variable `REACT_APP_API_URL`

### Problemas de autenticación
- Limpiar localStorage del navegador
- Verificar credenciales en el backend

### Estilos no se cargan correctamente
- Limpiar caché del navegador
- Verificar que los archivos CSS estén importados

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es propiedad de CONAVEG. Todos los derechos reservados.

---

**Nota**: Este README asume que tienes el backend de CONAVEG ejecutándose. Consulta la documentación del backend para instrucciones de instalación y configuración.