# Supported architectures amd64, arm32v7, arm64v8
ARG ARCH=amd64
FROM ${ARCH}/node:12-slim

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# RUN npm config set unsafe-perm true NOT NEEDED
RUN cd frontend/ && npm ci && npm run build
RUN npm install pm2 -g

# Expose internal port defined in Config.dev.internal_port
EXPOSE 3000

CMD [ "pm2-runtime", "--raw", "pm2.config.js" ]
