# TFG – Red social de recetas de cocina



## Descripción

Plataforma social donde los usuarios pueden crear, descubrir y valorar recetas de cocina. Incluye autenticación segura, análisis nutricional automático y despliegue escalable en AWS.

## Características principales

- Autenticación y autorización con JWT y roles.
- Feed público filtrable por ingredientes, tiempo y dificultad.
- Perfil de usuario con avatar, bio y seguidores.
- Likes, comentarios y favoritos.
- Análisis nutricional mediante la API de Edamam.
- Subida de imágenes a Amazon S3.
- Diseño responsive con React + TailwindCSS.
- Tema claro/oscuro.
- Panel de administración para moderación.
- Tests unitarios y de integración.

## Stack tecnológico

| Capa           | Tecnología                                           |
| -------------- | ---------------------------------------------------- |
| Frontend       | React 18, Vite, TypeScript, TailwindCSS              |
| Backend        | ASP.NET Core 8 Web API                               |
| ORM            | Entity Framework Core 8                              |
| Auth           | JWT + Refresh Tokens                                 |
| Base de datos  | Amazon RDS (SQL Server)                              |
| Almacenamiento | Amazon S3                                            |
| Despliegue     | AWS Elastic Beanstalk (API) y AWS Amplify (Frontend) |
| CI/CD          | GitHub Actions                                       |
| Nutrición      | Edamam Nutrition Analysis API                        |

## Arquitectura

```
[React SPA] → [API Gateway] → [ASP.NET Core API] → [Amazon RDS]
                           ↘︎ [Amazon S3] (Imágenes)
```

## Requisitos

- .NET 8 SDK
- Node.js 20+
- SQL Server local o RDS
- Cuenta de AWS
- Claves API de Edamam

## Configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu_usuario/tfg-recetas.git
cd tfg-recetas
```

### 2. Variables de entorno

Copia los archivos ejemplo y rellena tus credenciales:

```bash
cp src/Backend/RecipeSocial.Api/appsettings.Development.json.example src/Backend/RecipeSocial.Api/appsettings.Development.json
cp src/Frontend/.env.example src/Frontend/.env.local
```

Variables principales:

- JWT\_SECRET
- EDAMAM\_APP\_ID / EDAMAM\_APP\_KEY
- AWS\_ACCESS\_KEY\_ID / AWS\_SECRET\_ACCESS\_KEY
- AWS\_REGION
- S3\_BUCKET
- DB\_CONNECTION\_STRING

### 3. Backend

```bash
cd src/Backend
dotnet restore
dotnet ef database update
dotnet run
```

### 4. Frontend

```bash
cd ../Frontend
npm install
npm run dev
```

## Pruebas

```bash
dotnet test
npm run test
```

## Despliegue en AWS

1. Crear bucket S3 para imágenes.
2. Provisionar instancia RDS SQL Server.
3. Desplegar API a Elastic Beanstalk.
4. Desplegar frontend estático a Amplify o S3 + CloudFront.
5. Configurar secretos en AWS Parameter Store.

## Seguridad

- Contraseñas hasheadas con ASP.NET Identity.
- Revocación de tokens mediante tabla RefreshTokens.
- Roles y políticas mínimas en IAM.
- HTTPS obligatorio.

## Roadmap

- Notificaciones en tiempo real (SignalR).
- Planificador de menús semanales.
- Internacionalización (es, en, fr).
- Tests E2E con Playwright.
- Conversión a PWA.

## Contribuye

1. Haz un fork del proyecto.
2. Crea tu rama de feature.
3. Envía tus cambios y abre un Pull Request.

## Licencia

MIT

## Autor

**Tu Nombre** — @tu\_usuario

> Proyecto desarrollado como Trabajo Final de Grado en Ingeniería Informática, Universidad X (2025).

