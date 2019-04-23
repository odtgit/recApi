FROM jrottenberg/ffmpeg:3.4-alpine
FROM node:8-alpine

# copy ffmpeg bins from first image
COPY --from=0 / /

# our app
RUN mkdir -p /app /rec
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . /app
EXPOSE 23030
CMD [ "npm", "start" ]
