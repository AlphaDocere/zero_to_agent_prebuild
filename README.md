# 🛡️ Alpha Matrix: Zero to Agent Pre-build

Este repositorio contiene el sistema de gestión de talento y visualización de participantes para el ecosistema **Alpha Docere**. Está diseñado para procesar los registros del evento **"Zero to Agent"** y transformar datos estáticos en una matriz de colaboración funcional.

## 🚀 Estructura del Proyecto

El sistema utiliza **Next.js 14 (App Router)** y una arquitectura de datos basada en archivos locales para máxima velocidad de despliegue.

### 📂 Gestión de Datos
Los datos se consumen desde la carpeta `/data` en la raíz del proyecto:
* `participants.json`: Base de datos de registros iniciales.
* `responses.json`: Resultados de la encuesta de compromiso y nivel técnico.

### ⚙️ Componentes Core
* **Backend (`/api/matrix`):** Realiza un cruce de datos (inner-join) mediante el campo `email`.
* **Frontend (`/matrix2`):** Dashboard administrativo con búsqueda dinámica y filtrado por niveles.
* **Seguridad:** Capa de acceso mediante máscara de entrada (Keyphrase: `zerotoagent`).

## 📊 Metodología de Niveles (Alpha Docere)
El sistema clasifica el talento en 5 estadios técnicos:
1. **Curious:** Observación y aprendizaje.
2. **Explorer:** Experimentación activa.
3. **Builder:** Construcción de prototipos.
4. **Operator:** Despliegue y optimización de flujos.
5. **Architect:** Diseño de arquitectura de agentes.

## 🛠️ Configuración Local

1. **Instalación:**
   ```bash
   npm install

