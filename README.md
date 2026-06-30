# Best Cars Dealership — Full Stack Capstone

> A full-stack car dealership web application built as part of the IBM Full Stack Software Developer Professional Certificate capstone project.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [CI/CD](#cicd)
- [Contributing](#contributing)

---

## Project Overview

**Best Cars Dealership** is a multi-service web application that allows users to:
- Browse a list of car dealerships across the US
- Filter dealerships by state
- View customer reviews with sentiment analysis (positive / negative / neutral)
- Submit their own reviews for a dealership
- Register and log in to access full functionality

The application follows a **microservices architecture**, combining a Django REST backend, a Node.js Express dealer service, a Flask sentiment analyzer, a React SPA frontend, and MongoDB for review/dealer data.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6 |
| **Backend** | Django 4.x (Python 3.11), Django REST Framework |
| **Dealer Microservice** | Node.js 18, Express.js, Mongoose |
| **Sentiment Analyzer** | Flask 2.3 (Python 3.11) |
| **Database (SQL)** | SQLite (development), PostgreSQL (production) |
| **Database (NoSQL)** | MongoDB (dealers & reviews) |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes |
| **Cloud Platform** | IBM Cloud Code Engine |
| **CI/CD** | GitHub Actions |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
│                     React SPA (Port 3000)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP (proxied)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               Django Backend (Port 8000)                    │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  User Auth       │  │  djangoapp views / REST API      │ │
│  │  (SQLite / PG)   │  │  /djangoapp/get_dealers/         │ │
│  └──────────────────┘  │  /djangoapp/reviews/dealer/<id>/ │ │
│                        │  /djangoapp/add_review/          │ │
│                        │  /djangoapp/login/               │ │
│                        │  /djangoapp/register/            │ │
│                        └──────────────┬───────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                 │                           │
          Dealer data                   Sentiment
                 │                           │
                 ▼                           ▼
┌───────────────────────┐     ┌─────────────────────────┐
│  Node.js Microservice │     │  Flask Sentiment Service │
│  (Port 3000)          │     │  (Port 5000)             │
│  Express + Mongoose   │     │  POST /analyze           │
│  MongoDB backend      │     └─────────────────────────┘
│                       │
│  /fetchDealers        │
│  /fetchDealer/:id     │
│  /fetchReviews/:id    │
│  /insert_review       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│       MongoDB         │
│  Collections:         │
│  - dealers            │
│  - reviews            │
└───────────────────────┘
```

---

## Project Structure

```
xrwb-capstone/
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD
├── server/
│   ├── manage.py                    # Django management
│   ├── requirements.txt             # Python dependencies
│   ├── djangoproject/               # Django project settings
│   ├── djangoapp/                   # Main Django app
│   │   ├── models.py                # SQLite models (CarMake, CarModel)
│   │   ├── views.py                 # API views
│   │   └── urls.py
│   ├── frontend/                    # React SPA
│   │   ├── package.json
│   │   ├── public/
│   │   │   └── index.html
│   │   └── src/
│   │       ├── App.js               # Router
│   │       ├── index.js             # Entry point
│   │       ├── App.css
│   │       └── components/
│   │           ├── Header/
│   │           │   ├── Header.jsx   # Navigation + auth
│   │           │   └── Header.css
│   │           ├── Dealers/
│   │           │   ├── Dealers.jsx  # Dealer listing + filter
│   │           │   ├── Dealers.css
│   │           │   ├── Dealer.jsx   # Dealer detail + reviews
│   │           │   ├── Dealer.css
│   │           │   ├── PostReview.jsx
│   │           │   └── PostReview.css
│   │           ├── Login/
│   │           │   ├── Login.jsx
│   │           │   └── Login.css
│   │           └── Register/
│   │               ├── Register.jsx
│   │               └── Register.css
│   ├── database/                    # Node.js microservice
│   │   ├── app.js                   # Express + Mongoose service
│   │   └── package.json
│   └── sentimentanalyzer/           # Flask microservice
│       ├── app.py
│       ├── requirements.txt
│       └── Dockerfile
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB 6+ (running locally or via Docker)
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/xrwb-capstone.git
cd xrwb-capstone
```

---

### 2. Django Backend

```bash
cd server

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the development server
python manage.py runserver
# → http://localhost:8000
```

---

### 3. Node.js Dealer Microservice

```bash
cd server/database

# Install dependencies
npm install

# Start the service (MongoDB must be running)
npm start
# → http://localhost:3000
```

> The service auto-seeds the database with 5 dealers and 6 reviews on first run.

---

### 4. Flask Sentiment Analyzer

```bash
cd server/sentimentanalyzer

pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

---

### 5. React Frontend (development)

```bash
cd server/frontend

npm install
npm start
# → http://localhost:3000 (proxied to Django at :8000)
```

---

### 6. React Frontend (production build)

```bash
cd server/frontend
npm run build

# Django will serve the static build
cd ../..
python manage.py collectstatic
```

---

## API Endpoints

### Django Backend (`/djangoapp/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/djangoapp/get_dealers/` | All dealers |
| `GET` | `/djangoapp/get_dealers/:state/` | Dealers by state |
| `GET` | `/djangoapp/get_dealer/:id/` | Single dealer |
| `GET` | `/djangoapp/reviews/dealer/:id/` | Reviews for a dealer |
| `POST` | `/djangoapp/add_review/` | Submit a review |
| `POST` | `/djangoapp/login/` | User login |
| `GET` | `/djangoapp/logout/` | User logout |
| `POST` | `/djangoapp/register/` | New user registration |

### Node.js Microservice (`:3000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/fetchDealers` | All dealers |
| `GET` | `/fetchDealer/:id` | Single dealer |
| `GET` | `/fetchDealers/:state` | Dealers by state |
| `GET` | `/fetchReviews/:id` | Reviews for dealer |
| `POST` | `/insert_review` | Insert a review |
| `GET` | `/health` | Health check |

### Flask Sentiment Analyzer (`:5000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze` | Analyze review sentiment |
| `GET` | `/health` | Health check |

**Request body for `/analyze`:**
```json
{ "text": "The staff was fantastic and very helpful!" }
```
**Response:**
```json
{ "sentiment": "positive", "text": "The staff was fantastic..." }
```

---

## Deployment

### Docker Compose (local)

```bash
docker compose up --build
```

### IBM Cloud Code Engine

```bash
# Build and push images
docker build -t us.icr.io/<namespace>/best-cars-dealership ./server
docker push us.icr.io/<namespace>/best-cars-dealership

# Deploy to Code Engine
ibmcloud ce application create \
  --name best-cars-dealership \
  --image us.icr.io/<namespace>/best-cars-dealership \
  --port 8000
```

### Kubernetes

```bash
kubectl apply -f k8s/
kubectl get pods
kubectl get services
```

---

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

| Job | What it does |
|-----|-------------|
| `django-test` | Installs Python deps, runs `manage.py test` |
| `node-service` | Installs npm deps, runs Jest tests |
| `react-build` | Installs npm deps, runs `npm run build` |
| `flask-test` | Installs Flask, smoke-tests `/health` |
| `docker-build` | Builds Docker images for all services |

---

## Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'feat: add my feature'`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request against `main`

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

---

## License

This project is for educational purposes as part of the IBM Full Stack Software Developer Professional Certificate program.
