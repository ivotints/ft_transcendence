#!/bin/bash

source /env_vars

/usr/local/bin/python /code/manage.py set_users_offline >> /var/log/cron.log 2>&1