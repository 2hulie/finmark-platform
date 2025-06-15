<p align="center">
  <img src="docs/finmark-logo-full.png" alt="FinMark Logo" width="500"/>
</p>

# FinMark Platform Prototype

## Project Scope and Objectives

FinMark is a secure, scalable, and modular financial technology platform. The project aims to transform an existing monolithic system into a microservices-based solution, implementing best practices in security, scalability, and maintainability.

**Key objectives include:**
- Migrating modules to a microservices architecture
- Implementing an API Gateway and message bus/event stream
- Enhancing scalability through independent deployments and caching layers
- Integrating modern security measures (OAuth 2.0, 2FA, JWT)
- Supporting increased traffic and data loads
- Ensuring maintainability, reliability, and cost-effective deployment

---

## Current Prototype

### Features Implemented

- **User Authentication:**  
  - Register and login with JWT-based authentication
  - Role-based access (user/admin)
  - Protected frontend routes
- **Frontend:**  
  - React app with login, home, and admin pages
  - Token stored in localStorage for session persistence
- **Backend:**  
  - Node.js/Express microservice (`auth-service`)
  - PostgreSQL with Sequelize ORM
  - Modular structure: models, services, controllers, middleware
- **DevOps:**  
  - Docker and Docker Compose for local development

---

## Project Structure

```
finmark/
  README.md
  docker-compose.yml
  auth-service/      # Backend (user authentication microservice)
  client/            # Frontend (React app)
  docs/              # Documentation and milestone reports
```

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (for local development)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone the repository

```sh
git clone https://github.com/2hulie/finmark-platform.git
cd finmark
```

### 2. Environment Variables

- Copy `.env.example` to `.env` in `auth-service/` and fill in the values.
- **Never commit your real `.env` to the repository.**

### 3. Run with Docker

```sh
docker-compose up --build
```
- Backend: [http://localhost:5002](http://localhost:5002)
- Database: [localhost:5433](localhost:5433) (PostgreSQL)

### 4. Run Frontend Locally

```sh
cd client
npm install
npm start
```
- Frontend: [http://localhost:3000](http://localhost:3000)

---

## Usage

- Register a new user at `/register`
- Login at `/`
- Access `/home` (user) or `/admin` (admin) after login

## API Endpoints

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
- `GET /api/auth/me` — Get authenticated user info (requires Bearer token)

---

## Documentation

- See [`docs/Functional_Prototype_Documentation.md`](docs/Functional_Prototype_Documentation.md) for milestone details.