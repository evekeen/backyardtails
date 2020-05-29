FROM node:14-alpine
RUN mkdir -p /usr/backyardtails/backend
RUN mkdir -p /usr/backyardtails/ui
WORKDIR /usr/backyardtails
COPY backend/ backend/
COPY ui/ ui/
EXPOSE 8081
CMD [ "node", "backend/server.js" ]