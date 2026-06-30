# ---------------------------------------------------------------------------
# Dockerfile – Cars Dealership Django Backend
# ---------------------------------------------------------------------------
# Build:   docker build -t dealership-backend .
# Run:     docker run -p 8000:8000 dealership-backend
# ---------------------------------------------------------------------------

FROM python:3.11-slim

# Keeps Python from generating .pyc files and enables unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy project source
COPY . .

# Collect static assets (safe to run even if STATICFILES_DIRS is empty)
RUN python manage.py collectstatic --noinput || true

# Expose Django's default port
EXPOSE 8000

# Start with Gunicorn in production mode
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "djangoproj.wsgi:application"]
