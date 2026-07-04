#!/bin/sh
sed -i "s/PORT_PLACEHOLDER/${PORT:-8080}/g" /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
