FROM node:10.15.3-stretch

WORKDIR /app
RUN npm install -g @angular/cli

CMD ng serve --host 0.0.0.0
