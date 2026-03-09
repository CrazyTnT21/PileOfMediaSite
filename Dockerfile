FROM node:21-alpine

WORKDIR /app

RUN apk add --no-cache openssl
RUN tr -dc a-zA-Z0-9 < /dev/urandom | head -c 64 > password.txt
RUN openssl req -x509 -newkey rsa:4096 -keyout nginx.key -out nginx.pem -passout file:password.txt -sha256 -days 365 -nodes -subj "/"

RUN mkdir build
COPY build/package*.json ./build/
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
RUN mkdir -p /usr/share/nginx/html && mkdir /usr/share/nginx/content
COPY --from=0 /app/dist /usr/share/nginx/html
COPY --from=0 /app/nginx.key /app/password.txt /app/nginx.pem /etc/nginx/
RUN mv /usr/share/nginx/html/locations.nginx.conf /etc/nginx/
COPY nginx.conf /etc/nginx/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
