# Stage 1: Build
FROM node:20-bullseye as build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/AppSecurityFrontEnd/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY localhost+1.pem /etc/nginx/ssl/localhost+1.pem
COPY localhost+1-key.pem /etc/nginx/ssl/localhost+1-key.pem

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
