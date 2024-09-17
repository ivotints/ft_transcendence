#!/bin/bash

set -e

host="db"

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"

openssl req -x509 -newkey rsa:4096 -keyout /etc/ssl/private/key.pem -out /etc/ssl/certs/cert.pem -days 365 -nodes -subj "/CN=localhost"

python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py createsu # Creating admin user

python3 manage.py runserver_plus 0.0.0.0:8000 --cert-file /etc/ssl/certs/cert.pem --key-file /etc/ssl/private/key.pem

# exec "$@"