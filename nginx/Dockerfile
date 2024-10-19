FROM debian:11

RUN apt update -y && \
	apt install -y nginx \
	&& apt install -y openssl

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./entrypoint.sh /entrypoint.sh
COPY . .

RUN chmod +x /entrypoint.sh

RUN ls -la /

ENTRYPOINT ["/entrypoint.sh"]
