FROM node:lts
WORKDIR /app
COPY ./package.json ./package-lock.json tsconfig.json ./
COPY ./src ./src
RUN npm install --registry=https://registry.npm.taobao.org && npm run build
ENV SERVER_PORT=54321
ENV CONFIG_URL=https://gitee.com/alanway/test-node-web/raw/master/config.json
CMD [ "npm", "run", "docker" ]