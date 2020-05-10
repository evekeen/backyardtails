FROM node:14-alpine
RUN mkdir -p /usr/loveletter/backend
RUN mkdir -p /usr/loveletter/ui
WORKDIR /usr/loveletter
COPY backend backend
COPY ui ui
EXPOSE 8081
CMD [ "node", "backend/server.js" ]