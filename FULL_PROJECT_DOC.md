# Finmark Authentication Service – Documentation

## 1. Introduction

Welcome to the documentation for the **Authentication Service** of the Finmark platform, developed by **Group SD5**. This service is a core part of the Finmark ecosystem, responsible for handling all user authentication and security-related features.

Originally, the authentication system only supported basic login and logout. We have since transformed it into a modern, secure, and user-friendly solution with advanced features such as two-factor authentication (2FA), email verification, Google OAuth, and a robust password reset flow. This guide is designed to help both new and experienced developers understand, use, and extend the authentication service.

**What is Finmark?**

Finmark is a modular platform designed to support secure financial and user operations. The Authentication Service is just one part of the platform, but it is foundational for protecting user accounts and enabling secure access to other services.

**Key Features:**

- **JWT-based authentication:** Secure, stateless user sessions using JSON Web Tokens.
- **2FA (authenticator app and/or email):** Users can enable one or both methods for extra security. 2FA is enforced for all login flows, including Google OAuth.
- **Email verification:** Users must verify their email before logging in. Resend functionality is available.
- **Google OAuth login:** Users can sign in with their Google account. If 2FA is enabled, it is required after Google login as well.
- **Forgot Password & Reset:** Secure, token-based password reset flow with email delivery and expiration.
- **Modular, reusable codebase:** Both backend and frontend are organized for easy maintenance and extension.
- **Dockerized development:** Simple setup and deployment using Docker and Docker Compose.

**Tech Stack:**

- **Backend:**

  - **Node.js:** Provides the runtime environment for executing JavaScript code on the server, enabling a unified language across the stack.
  - **Express:** Used to quickly build RESTful APIs and handle HTTP requests/responses for all authentication-related operations.
  - **Sequelize:** Manages database models and queries in JavaScript, making it easier to interact with PostgreSQL and keep code maintainable.
  - **PostgreSQL:** Stores all persistent data, including user accounts, authentication details, 2FA secrets, and password reset tokens.

- **Frontend:**

  - **React:** Builds the user interface for all authentication flows, providing a responsive and interactive experience.
  - **Axios:** Handles all HTTP requests from the frontend to the backend API, such as login, registration, and 2FA verification.
  - **React Router:** Manages navigation between different authentication pages (login, register, 2FA, etc.) in a single-page app.

- **Email:**

  - **Nodemailer:** Sends transactional emails for account verification, 2FA codes, and password resets, ensuring secure communication with users.

- **2FA:**

  - **speakeasy:** Generates and verifies time-based one-time passwords (TOTP) for authenticator apps, providing strong two-factor authentication.
  - **qrcode:** Creates QR codes for users to easily set up authenticator apps with their 2FA secret.

- **OAuth:**

  - **passport:** Integrates third-party authentication strategies, allowing users to log in with external providers like Google.
  - **passport-google-oauth20:** Specifically enables Google OAuth login, making it easy for users to sign in with their Google accounts.

- **Docker & Docker Compose:**
  - **Docker:** Packages the backend, frontend, and database into containers for consistent development and deployment across environments.
  - **Docker Compose:** Orchestrates all containers (backend, frontend, database) so the entire authentication service can be started with a single command.

## 2. Architecture Overview

The project is organized as a monorepo with clear separation between backend and frontend:

- **auth-service/**: Node.js backend API for authentication
- **client/**: React frontend for user interaction
- **docs/**: Documentation and assets

The backend and frontend communicate via REST API calls. Docker Compose is used to orchestrate the backend, frontend, and PostgreSQL database for local development and deployment. This structure makes it easy to develop, test, and scale each part of the platform independently.

---

## 3. Backend (auth-service)

The backend is structured for clarity and maintainability:

- **controllers/**: Handle HTTP requests and responses (e.g., AuthController.js)
- **services/**: Business logic (e.g., AuthService.js)
- **models/**: Sequelize models for database tables (e.g., User.js)
- **routes/**: Define API endpoints (e.g., authRoutes.js)
- **middleware/**: Custom Express middleware (e.g., validateToken.js)
- **utils/**: Helper functions (e.g., email.js, validators.js, appError.js)
- **config/**: Database and passport configuration
- **migrations/**: SQL and JS scripts for evolving the database schema

### Authentication Flow

1. **User Registration:**
   - User submits registration form.
   - Backend creates user, sends verification email.
   - User must verify email before logging in.
2. **Login:**
   - User submits email and password.
   - If 2FA is enabled, user is prompted for 2FA code (authenticator app or email).
   - On success, JWT is issued for session.
3. **2FA Management:**
   - Users can enable/disable authenticator app and/or email 2FA independently.
   - `/2fa/status` endpoint allows frontend to check which methods are enabled.
4. **Google OAuth:**
   - Users can log in with Google.
   - If 2FA is enabled, user must complete 2FA after Google login.
   - New Google users are auto-verified and sent a welcome email.
5. **Forgot/Reset Password:**
   - User requests password reset; receives email with secure, expiring token.
   - User sets new password using the token.

### Main API Endpoints

- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Login (with 2FA support)
- `POST /api/auth/verify-email` – Verify email
- `POST /api/auth/resend-verification` – Resend verification email
- `POST /api/auth/2fa/setup` – Setup 2FA
- `POST /api/auth/2fa/verify` – Verify 2FA code
- `POST /api/auth/forgot-password` – Request password reset
- `POST /api/auth/reset-password` – Reset password
- `GET /api/auth/google` – Google OAuth login
- `GET /api/auth/google/callback` – Google OAuth callback

### Error Handling & Validation

- **Centralized error handler (`appError.js`):** All errors, including missing or invalid data, are caught and formatted into clear, consistent responses for the frontend. This prevents server crashes and provides helpful feedback to users and developers.
- **Input validation (`validators.js` and route-level checks):** Every API endpoint validates incoming data (e.g., required fields, email format, password strength). If data is missing or invalid, the API responds with a descriptive error message and does not proceed with the operation.
- **Frontend feedback:** The frontend displays error messages returned by the backend, guiding users to correct mistakes (such as empty fields, invalid email, or incorrect 2FA code) before resubmitting.

#### Common Error Scenarios & Error Messages

- **Registration:**

  - Missing fields: "Email, password, and name are required."
  - Email already exists: "Email already in use."
  - Invalid email: "Invalid email format."
  - Weak password: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."

- **Login:**

  - Missing fields: "Please enter both email and password."
  - Invalid credentials: "Invalid email or password."
  - Email not verified: "Please verify your email before logging in."

- **2FA:**

  - Missing code: "2FA code is required."
  - Invalid code: "Invalid or expired 2FA code."
  - Method not enabled: "Selected 2FA method is not enabled."

- **Password Reset:**

  - Missing email: "Email is required."
  - Invalid or expired token: "Invalid or expired password reset token."

- **Other:**
  - Trying to access protected routes without login: "Authentication required."
  - Server/database error: "An unexpected error occurred. Please try again later."

The frontend shows these messages directly to users so they know what went wrong and how to fix it.

### Environment & Docker

- `.env` files store secrets and configuration
- `Dockerfile` and `docker-compose.yml` enable containerized development and deployment

---

## 4. Frontend (client)

The frontend is a React application designed for a smooth and secure user experience:

- **Components:**
  - `Logo`, `PasswordInput`, `TwoFALogin`, `TwoFASetup`, etc. for reusable UI
- **Pages:**
  - `Login`, `Register`, `ForgotPassword`, `ResetPassword`, `Home`, `Admin`, `VerifyEmail`
- **Utils:**
  - Auth guards (`RequireAuth`, `RequireAdmin`) for protected routes
- **Styles:**
  - Centralized color palette in `styles/colors.js`
- **Assets:**
  - Logos and images in `public/assets/`

### Authentication UI/UX

- **Login:**
  - Email/password login
  - 2FA prompt if enabled (authenticator/email)
  - Google OAuth button (with local logo, styled per Google branding)
- **Register:**
  - Email verification required
  - Resend verification email with timer
- **2FA:**
  - Setup and login flows for both methods
  - Status queried from backend
- **Forgot/Reset Password:**
  - Request reset link
  - Enter new password via secure token
- **Error/status feedback:**
  - Clear error messages and success notifications
  - Button states and timers for resend actions

### State & Navigation

- React Router for navigation
- Local state for forms and feedback

### Theming

- Consistent look and feel via centralized color palette

---

## 5. Database

The database uses PostgreSQL and is managed via Sequelize ORM and migration scripts.

**User Table (main fields):**

- id, name, email, passwordHash
- isEmailVerified, emailVerificationToken
- twoFAEnabled, twoFAMethods, twoFASecret
- passwordResetToken, passwordResetExpires
- createdAt, updatedAt

**Migrations:**

- All schema changes are tracked in the `migrations/` folder (SQL and JS)

---

## 6. Deployment & Development

**Getting Started:**

1. Clone the repository
2. Copy `.env.example` to `.env` in both `auth-service/` and `client/`, then fill in your secrets (DB credentials, JWT secret, email SMTP, Google OAuth keys, etc.)
3. Run `docker-compose up --build` from the project root
4. Access the frontend at `http://localhost:3000` and the backend at `http://localhost:5002`

**Environment Variables:**

- Backend: DB credentials, JWT secret, email SMTP, Google OAuth keys
- Frontend: API base URL (if needed)

**Troubleshooting:**

- Check Docker logs for errors
- Ensure the database is running and accessible
- Verify `.env` values are correct

---

## 7. Future Improvements

You can easily improve the authentication service codebase by:

- **Add new authentication providers:**
  - Implement a new Passport strategy in the backend
  - Add a corresponding button and flow in the frontend
- **Add new features or pages:**
  - Create a new React page/component and add a backend endpoint as needed
- **Improve validation or security:**
  - Update `validators.js` and frontend validation logic
  - Add rate limiting middleware for brute-force protection (optional)

---

## 8. Security Notes

- 2FA is enforced for all login flows (including Google OAuth)
- Passwords are securely hashed using bcrypt
- JWTs are signed with a strong secret
- Email verification is required for all users
- Password reset tokens are single-use and expire after a set time
- (Optional) Rate limiting can be added for extra protection

---

## 9. FAQ / Common Issues

- **Login fails after registration:** Make sure you have verified your email by clicking the link sent to your inbox.
- **2FA code not accepted:** Double-check your device time and try resending the code. Ensure you are using the correct method (authenticator app or email).
- **Google OAuth not working:** Confirm your Google API keys and redirect URIs are set up correctly in the Google Developer Console and your `.env` file.
- **Docker won’t start:** Look for port conflicts or missing/incorrect `.env` values. Check Docker logs for more details.

---
