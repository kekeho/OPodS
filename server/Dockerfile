FROM node:8.16.0-jessie-slim

RUN mkdir /code
WORKDIR /code

# Install python dependencies
COPY ./package.json /code/
COPY ./package-lock.json /code/
RUN npm install

CMD ["npm", "start"]
