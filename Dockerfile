FROM node:alpine

WORKDIR /app
#TODO: Certificate
RUN apk add --no-cache openssl
RUN tr -dc a-ZA-Z0-9 < /dev/urandom | head -c 64 > password.txt
RUN openssl req -x509 -newkey rsa:4096 -keyout nginx.key -out nginx.pem -passout file:password.txt -sha256 -days 365 -nodes -subj "/"

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && mv /app/dist/modules.js /app/src

FROM nginx:alpine
RUN mkdir -p /usr/share/nginx/mycollection/html && mkdir /usr/share/nginx/mycollection/content
COPY --from=0 /app/src /usr/share/nginx/mycollection/html
COPY --from=0 /app/nginx.key /app/password.txt /app/nginx.pem /etc/nginx/
COPY nginx.conf /etc/nginx/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
