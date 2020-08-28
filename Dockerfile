# Supported architectures amd64, arm32v7, arm64v8
ARG ARCH=amd64


##### FRONTEND BUILD STEP
FROM ${ARCH}/node:12-slim as frontend

WORKDIR /build

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY src/frontend/package*.json ./
RUN npm ci

COPY src/frontend/ ./
RUN npm run build


##### MAIN
FROM ${ARCH}/node:12-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ src/

COPY --from=frontend /build/dist/ src/frontend/dist/

# Expose internal port defined in Config.dev.internal_port
EXPOSE 3000

VOLUME /app/share/

CMD [ "npx", "pm2-runtime", "--raw", "src/pm2.config.js" ]
