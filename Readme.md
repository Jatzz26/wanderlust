# WANDERLUST -> https://wanderlust-8ueg.onrender.com/listings

# Wanderlust Technologies 

Wanderlust Technologies is a full-stack web application built using **Node.js**, **Express.js**, **EJS**, **Bootstrap**, and **MongoDB**. It offers a comprehensive suite of features including user authentication (signup/login) and CRUD operations for travel listings and reviews.

---

## Features

- **User Authentication**: Secure user sign up, login, and session management using Passport.js.
- **CRUD Operations**: Full Create, Read, Update, and Delete capabilities for travel listings and user reviews.
- **Cloudinary Integration**: Cloud-based image upload and management.
- **Responsive Design**: Mobile-first UI using Bootstrap and standard CSS.
- **Dockerized Architecture**: Standardized containerization for application and database.
- **Kubernetes Ready**: Complete cluster orchestration manifests (Deployments, Services, ConfigMaps, Secrets, Ingress).
- **Automated CI/CD**: GitHub Actions pipeline for testing, Docker builds, and manifest validation.

---

## Quick Start (Local Development)

### 1. Traditional Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Jatzz26/wanderlust.git
   cd wanderlust
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start MongoDB locally, then run the app:
   ```bash
   npm start
   ```

5. Access the application at `http://localhost:8080/listings`.

---

## Docker & Docker Compose Setup

### 1. Run with Docker Compose (App + MongoDB)

Start the application and MongoDB in isolated containers with one command:

```bash
docker-compose up --build
```

- **Wanderlust Web App**: `http://localhost:8080`
- **Health Check Endpoint**: `http://localhost:8080/health`
- **MongoDB**: `localhost:27017`

To stop the containers:
```bash
docker-compose down
```

### 2. Standalone Docker Image Build

Build and run only the application container:

```bash
docker build -t wanderlust:latest .
docker run -p 8080:8080 --env-file .env wanderlust:latest
```

---

## Kubernetes Deployment (k8s)

All Kubernetes deployment manifests are located in the [`k8s/`](file:///d:/WEBD/PROJECTS/Wanderlust/k8s) directory.

### Deployment Steps:

1. **Create Namespace**:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   ```

2. **Configure ConfigMap & Secrets**:
   Copy secret template and fill in your actual credentials:
   ```bash
   cp k8s/secret.yaml.example k8s/secret.yaml
   ```
   Apply configuration:
   ```bash
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secret.yaml
   ```

3. **Deploy Database (MongoDB)**:
   ```bash
   kubectl apply -f k8s/mongodb-pvc.yaml
   kubectl apply -f k8s/mongodb-deployment.yaml
   ```

4. **Deploy Wanderlust Application**:
   ```bash
   kubectl apply -f k8s/app-deployment.yaml
   kubectl apply -f k8s/app-service.yaml
   kubectl apply -f k8s/ingress.yaml
   ```

5. **Verify Deployment**:
   ```bash
   kubectl get pods,svc -n wanderlust
   ```

---

## Continuous Integration (CI)

The GitHub Actions workflow is defined in [`.github/workflows/ci.yml`](file:///d:/WEBD/PROJECTS/Wanderlust/.github/workflows/ci.yml).

On every push or pull request to `main`/`master`, the pipeline automatically executes:
- **Lint & Syntax Check**: Runs `npm test` (`node --check app.js`).
- **Docker Build Check**: Builds the Docker container to catch build failures.
- **Kubernetes Validation**: Validates all YAML manifests in `k8s/`.
