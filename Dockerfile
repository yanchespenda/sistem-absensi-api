FROM node:19-alpine

RUN apk add --no-cache git

ENV PORT 3333

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN yarn install

# Copying source files
COPY . /usr/src/app

# Building app
RUN yarn build
EXPOSE 3333

# Running the app
CMD "yarn" "start"