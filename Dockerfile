FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy only necessary files for building
COPY . .

# Build the Next.js app
RUN npm run build

# Production stage for installing dependencies
FROM node:20-alpine AS production-dependencies

WORKDIR /app

# Copy only the necessary files for installing dependencies
COPY package*.json ./

# Install dependencies using npm ci for clean install
RUN npm ci --only=production

# Final stage for running the app
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY package.json ./

# Expose the port that Next.js will run on
EXPOSE 3000

RUN chown -R node:node /app
USER node

# Start the app in production mode
CMD ["npm", "start"]