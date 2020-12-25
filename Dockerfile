# start from ffmpeg image
FROM jrottenberg/ffmpeg:4.1-alpine as ffmpeg
FROM alpine AS base
COPY --from=ffmpeg / /
RUN apk add --no-cache tzdata \
    nodejs

# prepare app and nodejs
RUN mkdir -p /app /data/rec
WORKDIR /app
COPY package*.json /app/

# next stage for npm
FROM base AS dependencies
RUN apk add --no-cache npm
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install

# release layer
FROM base AS release
# copy production node_modules
COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY . /app

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

EXPOSE 23040
USER node
CMD [ "node", "recApi.js" ]
