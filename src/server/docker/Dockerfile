FROM node:24-alpine

# Install additional packages we need
RUN apk add --update --no-cache \
    alpine-sdk \
    curl \
    gcc \
    linux-headers \
    musl-dev \
    python3 \
    python3-dev \
    py3-pip

# just in case
RUN rm -rf /var/cache/apk/*

# link up python3
RUN ln -sf python3 /usr/bin/python

# Python auto-formatting
RUN pip install black --break-system-packages

# web content auto-formatting
RUN npm install -g prettier

# for universal convenience, install "http-server" 
RUN npm install -g http-server

# set up a user so we don't run as root
RUN adduser -D -h /home/app -s /bin/ash app
USER app
RUN git config --global --add safe.directory '*'
WORKDIR app

# set up our port and port-based healthcheck
ENV PORT=8000
EXPOSE 8000
HEALTHCHECK --start-period=30s --interval=5m CMD curl -f http://127.0.0.1:8000 || exit 1
