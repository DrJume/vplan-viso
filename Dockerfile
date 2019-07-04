FROM node:10-slim

# Create app directory
WORKDIR /opt/vplan-viso

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Bundle app source
COPY . .

RUN npm ci --only=production

RUN npm install pm2 -g

EXPOSE 8080
CMD [ "pm2-runtime", "--raw", "pm2.config.js" ]