# using multi stage-builds
# Stage build. It is responsible for building a production-ready artifact of our Vue.js app
FROM node:lts-alpine as build-stage

# make the 'app' folder the current working directory
WORKDIR /devops-app

# copy both 'package.json' and 'package-lock.json'
COPY package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'devops-app' folder)
COPY . .

# build app for production with minification
RUN npm run build

# Production stage. It is responsible for serving such artifact using NGINX
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /devops-app/dist /usr/share/nginx/html
EXPOSE 80

# Nginx uses the 'daemon off' directive to run in the foreground
CMD ["nginx", "-g", "daemon off;"]