FROM docker:dind

RUN apk update && apk add --no-cache curl jq

COPY cleanup.sh /usr/local/bin/cleanup.sh

RUN chmod +x /usr/local/bin/cleanup.sh

ENTRYPOINT ["/usr/local/bin/cleanup.sh"]
