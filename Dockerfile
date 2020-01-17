FROM jrottenberg/ffmpeg:4.1-alpine
FROM mhart/alpine-node

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
RUN npm ci --prod
COPY . /app
EXPOSE 23040
USER node
CMD [ "node", "recApi.js" ]
