FROM node:lts
WORKDIR /app
COPY ./package.json ./package-lock.json tsconfig.json ./
COPY ./src ./src
# RUN npm install -g cnpm --registry https://registry.npm.taobao.org && cnpm install && npm run build
RUN npm install && npm run build
CMD [ "npm", "run", "docker" ]