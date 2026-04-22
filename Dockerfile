FROM alpine
RUN apk add --update nodejs npm
COPY ./src /src
WORKDIR /src
RUN npm install
EXPOSE 3000
ENTRYPOINT ["node", "./server.js"]