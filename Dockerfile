# Use official Node.js runtime as base image
FROM node:22-alpine AS base

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
FROM base AS dependencies
RUN npm ci --omit=dev || npm install --omit=dev

# Application runner stage
FROM node:22-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy node_modules and application files
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY app.js ./
COPY CloudConfig.js ./
COPY middleware.js ./
COPY schema.js ./
COPY Controllers ./Controllers
COPY models ./models
COPY routes ./routes
COPY utils ./utils
COPY views ./views
COPY public ./public
COPY init ./init

# Set correct user permissions for security
USER node

# Expose server port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
CMD ["npm", "start"]
