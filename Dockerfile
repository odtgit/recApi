FROM jrottenberg/ffmpeg:3.4-alpine
FROM node:8-alpine

# copy ffmpeg bins from first image
COPY --from=0 / /

ENV USER=node
ENV UID=1000
ENV GID=1000

RUN addgroup --gid "$GID" "$USER" \
    && adduser \
    --disabled-password \
    --gecos "" \
    --home "$(pwd)" \
    --ingroup "$USER" \
    --no-create-home \
    --uid "$UID" \
    "$USER"

# our app
RUN mkdir -p /app /data/rec
RUN apk add -U tzdata
WORKDIR /app
COPY package*.json /app/
RUN npm install --production
COPY . /app
EXPOSE 23030
USER node
CMD [ "npm", "start" ]
