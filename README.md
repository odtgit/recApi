# recApi

A node.js REST API to schedule jobs in agenda to spawn ffmpeg to record stuff using URIs or predefined channels.

This is a learning project, expect everything to break.

It requires ffmpeg and mongodb available. Node dependencies are listed in the package.json file.

## Screenshot of UI (dark reader)

![Screenshot](recApi_UI.png)



## Installation

```
git clone https://github.com/odtgit/recApi
cd recApi
npm install
```

## Configuration
```
cp config.yml.example config.yml
```

Make changes as you see fit, docker-compose has example of bind mounts for external config and storage.

## Start

```
npm start
```

## Docker build and start

```
docker-compose up -d --build
```

## Usage

Browse to http://localhost:23040/
