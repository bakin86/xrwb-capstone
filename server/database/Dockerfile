FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (copy lockfile first for layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY app.js .

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose microservice port
EXPOSE 3000

ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "app.js"]
