FROM node:16

COPY . /usr/app
WORKDIR /usr/app

RUN npm i -g yarn
RUN yarn install
RUN yarn build

CMD [ "yarn", "start" ]