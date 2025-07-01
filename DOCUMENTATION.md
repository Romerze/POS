# Documentación del Sistema de Punto de Venta (POS)

## 1. Descripción General

Este proyecto es un sistema de Punto de Venta (POS) completo, diseñado como una aplicación web moderna. Su objetivo es proporcionar una solución integral para la gestión de operaciones comerciales, desde las ventas y el control de inventario hasta la administración de clientes y la generación de reportes. Una característica destacada es su integración con la API de Gemini de Google, lo que le permite incorporar funcionalidades avanzadas de inteligencia artificial.

La aplicación está construida con React y TypeScript, utilizando Vite como herramienta de empaquetado, lo que garantiza un desarrollo rápido y un rendimiento optimizado.

## 2. Características Principales

El sistema cuenta con los siguientes módulos:

*   **Autenticación de Usuarios:** Sistema seguro de inicio de sesión para proteger el acceso a la aplicación.
*   **Dashboard:** Un panel de control central que ofrece una vista rápida de las métricas más importantes del negocio.
*   **Gestión de Productos:** Permite agregar, editar, eliminar y organizar productos, incluyendo detalles como precio, stock y categoría.
*   **Ventas (Quick Sale):** Una interfaz rápida e intuitiva para procesar ventas de manera eficiente.
*   **Gestión de Clientes:** Módulo para administrar la información de los clientes y su historial de compras.
*   **Control de Inventario:** Herramientas para gestionar el stock de productos, realizar ajustes y prevenir quiebres de stock.
*   **Caja Registradora:** Funcionalidad para gestionar el flujo de efectivo, aperturas y cierres de caja.
*   **Gestión de Proveedores:** Permite llevar un registro de los proveedores y gestionar las relaciones comerciales.
*   **Gestión de Compras:** Módulo para registrar las órdenes de compra a proveedores y actualizar el inventario automáticamente.
*   **Gestión de Pagos:** Administra diferentes métodos de pago y registra las transacciones.
*   **Integraciones:** Conecta el sistema con servicios de terceros. Actualmente, incluye una integración con la API de Gemini para potenciar funcionalidades con IA.
*   **Gestión de Usuarios:** Permite al administrador crear, modificar y asignar roles y permisos a los usuarios del sistema.
*   **Reportes:** Genera informes detallados sobre ventas, inventario, clientes y rendimiento general del negocio.
*   **Configuración:** Panel para ajustar las configuraciones generales de la aplicación.

## 3. Tecnologías Utilizadas (Tech Stack)

*   **Frontend:** React, TypeScript
*   **Enrutamiento:** React Router DOM
*   **Herramienta de Construcción:** Vite
*   **Gestión de Estado:** React Hooks (useContext, useState, etc.)
*   **Estilos:** (No especificado, probablemente CSS, SASS o un framework como Material-UI/Tailwind CSS)
*   **Inteligencia Artificial:** Google Gemini API

## 4. Estructura del Proyecto

El proyecto sigue una estructura modular y organizada para facilitar el mantenimiento y la escalabilidad:

```
c:\Proyectos\SistemaPOS\
├── .env.local         # Variables de entorno locales (incluyendo la API Key de Gemini)
├── .gitignore         # Archivos ignorados por Git
├── App.tsx            # Componente principal y configuración de rutas
├── components/        # Directorio de componentes de React
│   ├── Auth/          # Componentes de autenticación (LoginPage)
│   ├── CashRegister/  # Componentes de caja registradora
│   ├── Customers/     # Componentes de gestión de clientes
│   ├── Dashboard/     # Componentes del panel de control
│   ├── Integrations/  # Componentes para integraciones con APIs
│   ├── Inventory/     # Componentes de control de inventario
│   ├── Layout/        # Componente de la estructura principal (menús, etc.)
│   ├── Payments/      # Componentes de gestión de pagos
│   ├── Products/      # Componentes de gestión de productos
│   ├── Purchases/     # Componentes de gestión de compras
│   ├── Reports/       # Componentes de reportes
│   ├── Sales/         # Componentes de ventas
│   ├── Settings/      # Componentes de configuración
│   ├── Suppliers/     # Componentes de gestión de proveedores
│   └── Users/         # Componentes de gestión de usuarios
├── constants.ts       # Constantes utilizadas en la aplicación
├── hooks/             # Hooks personalizados de React (ej. useAuth)
├── index.html         # Punto de entrada HTML
├── index.tsx          # Punto de montaje de la aplicación React
├── package.json       # Dependencias y scripts del proyecto
├── services/          # Lógica para comunicarse con APIs externas
├── tsconfig.json      # Configuración de TypeScript
├── types.ts           # Definiciones de tipos de TypeScript
└── vite.config.ts     # Configuración de Vite
```

## 5. Instalación y Ejecución

Sigue estos pasos para ejecutar el proyecto en un entorno local:

**Prerrequisitos:**
*   Tener Node.js instalado.

**Pasos:**

1.  **Clonar el repositorio (si aplica):**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd SistemaPOS
    ```

2.  **Instalar dependencias:**
    Abre una terminal en la raíz del proyecto y ejecuta:
    ```bash
    npm install
    ```

3.  **Configurar la API Key de Gemini:**
    Crea un archivo `.env.local` en la raíz del proyecto y añade tu clave de API de Gemini:
    ```
    GEMINI_API_KEY=TU_API_KEY_AQUI
    ```

4.  **Ejecutar la aplicación:**
    Para iniciar el servidor de desarrollo, ejecuta:
    ```bash
    npm run dev
    ```

5.  **Abrir en el navegador:**
    La aplicación estará disponible en la URL que se muestre en la terminal (generalmente `http://localhost:5173`).

## 6. Descripción de Módulos (Componentes)

*   **`App.tsx`:** Es el corazón de la aplicación. Define la estructura de enrutamiento utilizando `react-router-dom`, distinguiendo entre rutas públicas (como `/login`) y rutas protegidas que requieren autenticación.

*   **`hooks/useAuth.tsx`:** Un hook personalizado que maneja la lógica de autenticación, como verificar si un usuario ha iniciado sesión, y proporciona esta información a los componentes que la necesiten.

*   **`components/Layout/Layout.tsx`:** Este componente envuelve las páginas protegidas. Generalmente contiene elementos comunes de la interfaz como la barra de navegación lateral, la cabecera y el pie de página, asegurando una experiencia de usuario consistente.

*   **`components/Auth/LoginPage.tsx`:** Contiene el formulario y la lógica para que los usuarios inicien sesión en el sistema.

*   **`services/*`:** Los archivos dentro de este directorio contienen la lógica para realizar llamadas a APIs externas, incluyendo la API de Gemini y cualquier otro backend que el sistema pueda necesitar.
