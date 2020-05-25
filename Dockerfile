# Supported architectures amd64, arm32v7, arm64v8
ARG ARCH=amd64


##### FRONTEND
FROM ${ARCH}/node:12-slim as frontend

WORKDIR /frontend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


##### MAIN
FROM ${ARCH}/node:12-slim

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ backend/

COPY --from=frontend /frontend/dist/ frontend/dist/

# Expose internal port defined in Config.dev.internal_port
EXPOSE 3000

CMD [ "npx", "pm2-runtime", "--raw", "backend/pm2.config.js" ]
