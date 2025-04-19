FROM node:21-alpine

WORKDIR /app

RUN apk add --no-cache openssl
RUN tr -dc a-zA-Z0-9 < /dev/urandom | head -c 64 > password.txt
RUN openssl req -x509 -newkey rsa:4096 -keyout nginx.key -out nginx.pem -passout file:password.txt -sha256 -days 365 -nodes -subj "/"

RUN mkdir build
COPY build/package*.json ./build/
COPY package*.json ./
RUN npm install
RUN cd build && npm install
COPY . .
RUN node locations.js
RUN npm run build

FROM nginx:alpine
RUN mkdir -p /usr/share/nginx/pileofmedia/html && mkdir /usr/share/nginx/pileofmedia/content
COPY --from=0 /app/dist /usr/share/nginx/pileofmedia/html
COPY --from=0 /app/nginx.key /app/password.txt /app/nginx.pem /etc/nginx/
COPY --from=0 /app/locations.nginx.conf /etc/nginx/
COPY nginx.conf /etc/nginx/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
