# 🍲 FoodAI - Despensa Inteligente y Evolucionada

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

FoodAI es una Aplicación Web Progresiva (PWA) diseñada para revolucionar la gestión del hogar. Utiliza Inteligencia Artificial generativa para identificar ingredientes, gestionar tu despensa y crear flujos de experiencia de usuario personalizados.

## 🚀 Características del MVP
* **Autenticación Segura y Sin Fricción:** Integración nativa con Google Auth y Email via Firebase.
* **Gestión de Estado en Tiempo Real:** Base de datos NoSQL para inventario en vivo.
* **Capa de IA Generativa:** Conexión directa con Google Gemini 2.5 Flash a través de Firebase Genkit.
* **UI/UX Premium:** Diseño responsivo con Tailwind CSS y componentes shadcn/ui.

---

## 🏗️ 1. Diagrama de Arquitectura 

La plataforma está diseñada con una arquitectura *Serverless* de alta escalabilidad, separando la capa de presentación de los servicios de backend y el motor de inferencia de IA.

### Componentes Principales:
* **Frontend (Cliente):** Construido con **Next.js** (App Router) y React. Utiliza Tailwind CSS y shadcn/ui para el diseño de interfaces. Maneja el estado global de la despensa y la internacionalización.
* **Backend as a Service (BaaS):** **Firebase** gestiona toda la lógica del lado del servidor:
    * *Firebase Auth:* Manejo de identidades (Google y Correo/Contraseña).
    * *Firestore:* Base de datos NoSQL en tiempo real para almacenar el inventario de la despensa y el historial de recetas de cada usuario.
* **Modelos de IA:** Integración de flujos de IA (Genkit/Gemini u otros modelos configurados) para generar ideas de recetas.
* **Despliegue (Hosting & CI/CD):** Alojado en **Vercel**, conectado a **GitHub** para despliegues automáticos.

![Diagrama de Arquitectura de FoodAI](./docs/arquitectura.png)


## ⚙️ 2. Flujo de Integración y Despliegue Continuo (CI/CD)

Para garantizar iteraciones rápidas y estables durante la fase MVP, el proyecto cuenta con un pipeline de automatización completo (GitOps). Todo cambio registrado en el repositorio principal dispara automáticamente una compilación y actualización sin caídas en la red global.

![Flujo de Despliegue CI/CD](./docs/flujo-cicd.png)


Mira el proyecto en acción y el proceso de despliegue aquí:

https://github.com/user-attachments/assets/dccfc0f8-24ee-4a04-ba71-e285b18a2069

---

## 🛠️ 3. Instrucciones de Instalación y Ejecución (Reproducibilidad)

Sigue estos pasos para replicar el entorno de desarrollo de FoodAI en tu máquina local.

### 🚀 Pasos para la ejecución local

Requisitos Previos

- Node.js (v18 o superior).

- Una cuenta y proyecto en Firebase Console.

- Git instalado en tu computadora.

Instalación Paso a Paso

**1. Clonar el repositorio:**

git clone [https://github.com/marylinfernandez/Food-AI-MVP.git](https://github.com/marylinfernandez/Food-AI-MVP.git)
cd Food-AI-MVP

**2. Instalar las dependencias:**
npm install

**3. Configurar variables de entorno:**

Crea un archivo llamado .env.local en la raíz del proyecto y añade las credenciales de tu proyecto de Firebase:


NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

(Nota: Asegúrate de habilitar los métodos de autenticación de Google y Correo/Contraseña en tu consola de Firebase, y agregar localhost a tus dominios autorizados en la sección de Authentication).

**4. Ejecutar el servidor de desarrollo:**

npm run dev

La aplicación estará disponible en http://localhost:3000.

**5. Despliegue en Producción (Vercel)**

Este proyecto está configurado para desplegarse fácilmente en Vercel de forma automática:

- Sube tus cambios a GitHub (git push).
- Ve a Vercel y haz clic en "Add New Project".
- Importa tu repositorio Food-AI-MVP.
- En el apartado de Environment Variables, pega las mismas variables de Firebase que pusiste en tu archivo .env.local.
- Haz clic en Deploy.

⚠️ IMPORTANTE para Producción: 

Recuerda agregar el dominio generado por Vercel (ej. food-ai-mvp.vercel.app) a los dominios autorizados en la sección de Authentication de tu consola de Firebase. Si no haces esto, el inicio de sesión con Google será bloqueado por seguridad.
