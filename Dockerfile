FROM jrottenberg/ffmpeg:3.4-alpine
FROM node:8-alpine

# copy ffmpeg bins from first image
COPY --from=0 / /

# our app
RUN mkdir -p /app /rec
RUN apk add -U tzdata
WORKDIR /app
COPY package*.json /app/
RUN npm install --production
COPY . /app
EXPOSE 23030
CMD [ "npm", "start" ]
