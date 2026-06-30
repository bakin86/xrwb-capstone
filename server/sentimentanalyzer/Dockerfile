# ── Build Stage ───────────────────────────────────────────────────────────────
FROM python:3.11-slim AS base

# Set working directory
WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app.py .

# ── Runtime Configuration ──────────────────────────────────────────────────────
# Run as non-root user for security
RUN adduser --disabled-password --gecos "" appuser
USER appuser

# Expose Flask port
EXPOSE 5000

# Environment defaults (override at runtime)
ENV PORT=5000 \
    FLASK_DEBUG=false

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')"

# Launch the service
CMD ["python", "app.py"]
