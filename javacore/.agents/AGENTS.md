# javacore — Repo-Specific Agent Context & Development Rules

## Overview

`javacore` is the **Spring Boot 3 + Hibernate template repository** for Forge. It provides an enterprise-ready Java 21 foundation adhering strictly to SOLID principles, Kernel/Module architecture, Flyway migrations, and centralized error/configuration management.

---

## 🏛️ Architecture & Kernel Boundaries

```
src/main/java/com/forge/javacore/
├── JavacoreApplication.java
└── core/                            # Stable Kernel
    ├── auth/                        # Security, JwtAuthenticationFilter, JwtTokenProvider
    ├── config/                      # AppProperties & SecurityProperties (@ConfigurationProperties)
    ├── db/                          # JPA BaseEntity (UUID primary keys)
    ├── dto/                         # ApiResponse<T> domain-agnostic HTTP wrapper
    ├── error/                       # AppException & GlobalExceptionHandler
    └── user/                        # User domain, service, repository, REST controllers
```

### Architectural Invariants:
1. `core/` contains stable kernel contracts, auth, database, configuration, and error primitives.
2. Business modules (when added under `com.forge.javacore.modules`) depend on `core/`, NEVER on each other.
3. No horizontal cross-imports between feature modules.

---

## 📜 Mandatory Development Rules

### 1. SOLID Principles
- **Single Responsibility (SRP):** Controllers handle HTTP request/response validation and routing only; Services encapsulate business logic; Repositories handle data access.
- **Open/Closed (OCP):** Core contracts and interfaces are open for extension, closed for modification.
- **Liskov Substitution (LSP):** Implementation classes must honor full interface contracts without unexpected side-effects.
- **Interface Segregation (ISP):** Define focused interfaces (e.g. `IUserService`) instead of monolithic repositories/services.
- **Dependency Inversion (DIP):** Depend on abstractions (interfaces) and inject dependencies via constructor injection (using Lombok `@RequiredArgsConstructor` or explicit constructors).

### 2. Centralized Error Handling
- **Always use `AppException`** for domain, validation, authorization, and business logic errors:
  - `AppException.badRequest("Invalid payload")`
  - `AppException.unauthorized("Invalid credentials")`
  - `AppException.forbidden("Insufficient permissions")`
  - `AppException.notFound("Resource not found")`
  - `AppException.conflict("Resource already exists")`
- **Do NOT** throw raw `RuntimeException`, `IllegalArgumentException`, or construct custom HTTP response objects directly inside controllers.
- **Module Custom Exceptions:** Feature modules should declare domain-specific exceptions extending `AppException` (e.g. `NotificationNotFoundException extends NotificationException` where `NotificationException extends AppException`). They are automatically intercepted by the core `GlobalExceptionHandler` without needing core modifications.
- All exceptions are intercepted centrally by `GlobalExceptionHandler` and converted into uniform `ErrorResponse` payloads.

### 3. Centralized Environment & Configuration Properties
- **Always use `AppProperties`** (`com.forge.javacore.core.config.AppProperties`) for configuration settings and environment variables.
- **Do NOT** use `@Value("${...}")` annotations scattered throughout services, controllers, or providers. Inject `AppProperties` instead.
- **Never hardcode default secrets** or passwords in Java code or tracked `.yml` files.
- Enforce `@PostConstruct` validation in configuration classes to fail fast with explicit error logging if required environment variables are missing.

### 4. Database & Entity Standards
- **Primary Keys:** Every JPA entity must extend `BaseEntity` and use `UUID` as its primary key type.
- **Schema Migrations:** Never rely on Hibernate `ddl-auto=update` or `create`. All database schema changes MUST be introduced via Flyway SQL migrations under `src/main/resources/db/migration/` (e.g., `V1__...`, `V2__...`).

### 5. Naming Conventions & Code Style
- **No Single-Letter Variables:** Variable names must clearly convey intent (e.g. `userRepository`, `tokenPayload`, `errorMessage`).
- **Standard API Responses:** All REST API controller endpoints MUST wrap successful response data using `ApiResponse.success(data)` or `ApiResponse.success(data, message)`.

### 6. Lombok & Type Safety
- **Use Lombok Annotations:** Use Lombok (`@Getter`, `@Setter`, `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Slf4j`) across DTOs, entities, services, and controllers to maintain concise, clean code. (For JPA entities, use `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` instead of `@Data`).
- **Use Strongly-Typed Java Enums:** Never compare against or store raw string literals for domain statuses, types, or categories. Always define dedicated Java `enum` classes and map JPA entity fields with `@Enumerated(EnumType.STRING)`.

