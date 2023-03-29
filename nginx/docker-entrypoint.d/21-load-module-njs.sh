#!/bin/sh

set -e
ME=$(basename $0)

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

DEFAULT_CONF_FILE=/etc/nginx/nginx.conf

if [ ! -f "/$DEFAULT_CONF_FILE" ]; then
    entrypoint_log "$ME: info: /$DEFAULT_CONF_FILE is not a file or does not exist"
    exit 0
fi

# check if the file can be modified, e.g. not on a r/o filesystem
touch /$DEFAULT_CONF_FILE 2>/dev/null || { entrypoint_log "$ME: info: can not modify /$DEFAULT_CONF_FILE (read-only file system?)"; exit 0; }

# check if the file is already modified, e.g. on a container restart
grep -q "ngx_http_js_module.so" /$DEFAULT_CONF_FILE && { entrypoint_log "$ME: info: NGINX Module NJS already declared in $DEFAULT_CONF_FILE"; exit 0; }

sed -i '/events {/i load_module modules/ngx_http_js_module.so; \n' $DEFAULT_CONF_FILE

exit 0