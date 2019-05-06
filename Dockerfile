FROM node:10.15.3-stretch

WORKDIR /app
RUN npm install -g @angular/cli

EXPOSE 4200

CMD ng serve --host 0.0.0.0
