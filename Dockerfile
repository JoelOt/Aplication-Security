FROM node:20-bullseye as build-step

RUN mkdir -p /app

WORKDIR /app

COPY ./frontend/package*.json /app

RUN npm install

RUN npm install -g @angular/cli


COPY ./frontend /app

RUN ng build --configuration production

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
