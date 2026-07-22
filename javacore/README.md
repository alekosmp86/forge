# javacore ☕

**javacore** is the Spring Boot 3 + Hibernate + Spring Security template repository for **Forge**.

It provides an enterprise-ready Java foundation with clean Kernel / Module architecture, SOLID design principles, Flyway database migrations, and JWT stateless authentication.

---

## 🏗️ Stack & Dependencies

- **Language & Framework**: Java 21 + Spring Boot 3.4.2
- **Database & ORM**: PostgreSQL + Spring Data JPA / Hibernate (with UUID primary keys)
- **Database Migrations**: Flyway (`src/main/resources/db/migration/`)
- **Security & Auth**: Spring Security 6 + JJWT (`io.jsonwebtoken:jjwt-api:0.12.6`)
- **Validation**: Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`)
- **Build System**: Apache Maven (`pom.xml`)

---

## 🏛️ Architecture

`javacore` adheres to strict Kernel separation:

```text
src/main/java/com/forge/javacore/
├── JavacoreApplication.java
└── core/                            # Stable Kernel
    ├── auth/                        # Spring Security, JWT filter & provider
    ├── db/                          # JPA BaseEntity with UUID keys
    ├── error/                       # AppException & GlobalExceptionHandler
    └── user/                        # User domain, service, repository, REST controllers
```

---

## 🛠️ Quick Start

### 1. Environment Setup
Configure your database credentials in `src/main/resources/application.yml` or set environment variables:

```bash
export DATABASE_URL="jdbc:postgresql://localhost:5432/javacore_db"
export DB_USERNAME="postgres"
export DB_PASSWORD="postgres"
export SESSION_SECRET="super-secret-jwt-key-minimum-32-characters-long-for-security"
```

### 2. Build & Run
```bash
# Compile and build JAR package
mvn clean package

# Run Spring Boot application
mvn spring-boot:run
```

---

## 📄 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user and return JWT bearer token |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `GET` | `/api/users` | Admin (`ROLE_ADMIN`) | List all registered users |
| `GET` | `/api/users/{id}` | Admin (`ROLE_ADMIN`) | Get user details by UUID |
