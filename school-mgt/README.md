# School Management Backend

A modular school-management REST API built with **NestJS, TypeScript, PostgreSQL and TypeORM**. The system is designed to centralize core academic and administrative workflows such as authentication, users, students, classes and attendance while providing a maintainable foundation for additional school operations.

## Overview

The project follows NestJS's modular architecture and separates HTTP controllers, business services, DTOs, guards and database entities. PostgreSQL provides relational persistence through TypeORM.

The backend is intended to support authenticated school users and protect sensitive operations with authentication and authorization mechanisms.

## Core capabilities

- User registration and authentication
- JWT-based authentication
- Google authentication support
- Password management
- Profile management
- Role-aware authorization foundations
- Student management
- Class management
- Attendance management
- Relational database persistence
- DTO-based request validation
- Unit and end-to-end testing setup

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | NestJS 11 |
| Language | TypeScript 5 |
| Database | PostgreSQL |
| ORM | TypeORM |
| Authentication | JWT / Passport-based authentication |
| OAuth | Google authentication support |
| Testing | Jest / Supertest |
| Code quality | ESLint / Prettier |

## Architecture

The application uses a feature-oriented NestJS structure:

```text
Client
  |
  v
REST API
  |
  +----------------------+
  |      NestJS App      |
  |                      |
  |  Auth                |
  |  Students            |
  |  Classes             |
  |  Attendance          |
  |  Users / Roles       |
  |                      |
  +----------+-----------+
             |
             v
        TypeORM
             |
             v
        PostgreSQL
```

### Authentication flow

```text
Client
  |
  v
Login / Register
  |
  v
Auth Controller
  |
  v
Auth Service
  |
  +--> Credential validation
  +--> Password handling
  +--> JWT generation
  +--> OAuth integration
  |
  v
JWT-protected endpoints
```

## Project structure

The main application lives in the `school-mgt` directory and follows NestJS conventions. Feature modules contain their own controllers, services, DTOs and entities where appropriate.

A simplified view is:

```text
school-mgt/
├── src/
│   ├── auth/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── guards/
│   │   └── strategies/
│   ├── student/
│   ├── classes/
│   ├── attendance/
│   └── ...
├── test/
├── package.json
└── tsconfig.json
```

## Data model

The backend uses PostgreSQL with TypeORM entities and relationships. The domain includes relationships between users, students, classes and attendance records.

A simplified domain model is:

```text
User
 |
 +---- authentication / authorization
 |
 +---- Student
          |
          +---- Class
          |
          +---- Attendance
```

The exact entity relationships should be treated as implementation details and can evolve as additional academic modules are introduced.

## Authentication & authorization

The authentication layer provides the foundation for securing school-management resources.

Implemented concepts include:

- Registration
- Login
- JWT authentication
- Authentication guards
- Role decorators/guards
- Password changes
- Profile updates
- Google OAuth authentication

Sensitive routes can therefore be protected before requests reach application business logic.

## Validation and error handling

The project uses NestJS's DTO-oriented approach to define and validate incoming request data. This keeps API contracts explicit and helps prevent invalid data from reaching business logic or the database.

## Testing

The project is configured for both unit and end-to-end testing.

```bash
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm
- Git

### Clone

```bash
git clone https://github.com/Oluwatobi843/school-management-backend.git
cd school-management-backend/school-mgt
```

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file containing the database and authentication configuration required by the application. Do not commit real credentials or secrets to GitHub.

Example structure:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
JWT_SECRET=your-secret
```

Use the variables expected by the current application configuration when deploying or running the project.

## Running the application

### Development

```bash
npm run start:dev
```

### Production build

```bash
npm run build
npm run start:prod
```

## Code quality

Format the code with:

```bash
npm run format
```

Run linting with:

```bash
npm run lint
```

## API development approach

The backend follows a REST-oriented approach where:

1. Controllers receive HTTP requests.
2. DTOs define and validate request data.
3. Guards and authentication mechanisms protect restricted resources.
4. Services contain business logic.
5. TypeORM entities represent persistent domain models.
6. PostgreSQL stores relational data.

This separation makes individual modules easier to test, maintain and extend.

## Security considerations

The project is designed around several backend security practices:

- Passwords should never be stored as plain text.
- JWT secrets must be provided through environment configuration.
- Protected routes should use authentication/authorization guards.
- Input should be validated through DTOs.
- Production credentials must remain outside the repository.
- OAuth credentials should be supplied through environment variables.

## Roadmap

Potential future improvements include:

- Swagger/OpenAPI documentation for every endpoint
- Refresh-token rotation and session management
- More granular role/permission policies
- Teacher and parent portals
- Subjects and academic-term management
- Examination and grading modules
- Timetable management
- Fee/payment management
- Notifications
- Audit logs
- Docker-based development/deployment
- CI/CD pipeline
- Production monitoring and logging

## Why this project matters

This project demonstrates practical backend engineering with a structured framework rather than a single-file API. It combines **NestJS modular architecture, TypeScript, relational database design, authentication, authorization, validation and automated testing**.

It is intended as a foundation that can grow into a complete school-management platform.

## Author

**Oluwatobi843**

GitHub: https://github.com/Oluwatobi843

## License

See the repository license for the applicable terms.
