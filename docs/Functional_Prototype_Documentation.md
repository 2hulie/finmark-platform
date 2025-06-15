# Functional Prototype Documentation

## What We Set Up and Why

### Project Structure
The project is organized into two main parts:
- **Backend (`auth-service`)**: Handles user authentication and authorization.
- **Frontend (`client`)**: Provides the user interface with pages for login, home, and admin.

### Core Feature
A working user authentication system was implemented. Users can register, log in, and access protected pages depending on their role (either user or admin).

### Technologies Chosen
- **Backend**: Node.js, Express, PostgreSQL (with Sequelize ORM), JWT for authentication.
- **Frontend**: React (for UI), Axios (for API calls).
- **Docker**: Used for environment consistency and simplified development setup.

### Configuration
- Environment variables are managed with `.env` files.
- Docker Compose is used to run the backend and database together for local development.

### Modularity & Reusability
- The backend uses a modular structure (models, services, controllers) to keep the logic clean and maintainable.
- The API is RESTful and designed to support both web and mobile clients.

---

## Challenges Encountered

### Modularization
- We worked on refactoring the backend to split into modular services using `AuthController`, `AuthService`, middleware (`validateToken`), and Sequelize models.
- We had to make sure each part had a clear role: routes for paths, controllers for requests, and services for business logic. This helped keep the code clean and reusable.

### Security Implementation
- We successfully implemented JWT authentication, but had to make sure roles (admin vs user) were validated and protected correctly on both frontend and backend.

### Error Handling
- We made sure API errors, such as duplicate user or invalid password, were caught and shown properly, but this required custom messaging and handling in both controller and UI.

---

## What Worked and What Needs Refinement

### What Worked
- JWT securely stores user identity and role.
- React components such as `Logo` and `PasswordInput` were made reusable and modular.
- Frontend redirects based on decoded token role (admin vs. user).

### What Needs Refinement
- Plan to implement rate-limiting to prevent brute-force attacks.
- Further enhance form validation (e.g., password strength, matching confirmation).
- Improve performance by optimizing SQL queries, adding explicit database indices, and introducing caching for frequently accessed data.
- Document backend routes using Postman, and add basic unit tests for reliability.
