# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Copy language files
RUN npm run postinstall

# Build the application (optional - for production)
# RUN npm run build

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies)
# Use install instead of ci for better compatibility
RUN npm install --legacy-peer-deps --no-audit --no-fund || \
    npm install --legacy-peer-deps --no-audit --no-fund

# Copy source code
COPY . .

# Copy language files
RUN npm run postinstall || true

# Expose port
EXPOSE 3101

# Start development server
CMD ["npm", "start"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm ci --only=production --silent

# Expose port
EXPOSE 3101

# Start production server
CMD ["npm", "run", "preview"]