FROM python:3.11

ENV PYTHONUNBUFFERED=1

WORKDIR /code

RUN pip install django psycopg2-binary djangorestframework

COPY ./entrypoint.sh /entrypoint.sh
COPY . .

RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

CMD ["python3","manage.py","runserver","0.0.0.0:8000"] 