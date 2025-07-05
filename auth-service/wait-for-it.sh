#!/usr/bin/env bash
# wait-for-it.sh: Wait until a host and port are available
# Usage: wait-for-it.sh host:port -- command args

set -e

host="$1"
shift

host_name="${host%%:*}"
port="${host##*:}"

for i in {1..60}; do
  nc -z "$host_name" "$port" && break
  echo "Waiting for $host_name:$port... ($i)"
  sleep 1
done

exec "$@"
