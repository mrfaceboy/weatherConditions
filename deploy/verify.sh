#!/usr/bin/env bash
# Proves the app is reachable only through the VPN.
#
#   1. From the host (outside the VPN): weather.internal does not resolve.
#   2. From a container on the edge network (outside the VPN): DNS gives
#      NXDOMAIN and the app's private IP is unreachable.
#   3. From a WireGuard client container (inside the VPN): the name resolves
#      and the app responds.
#
# Uses the dedicated "verify" peer so it never collides with the reviewer's
# own tunnel.
set -uo pipefail

cd "$(dirname "$0")"

HOST=weather.internal
APP_IP=10.200.0.10
VPN_DNS=10.13.13.1
PEER_CONF=wireguard/peer_verify/peer_verify.conf
EDGE_NET=weather_edge
TOOLS_IMAGE=alpine:3.22
failures=0

pass() { printf '  \033[32mPASS\033[0m %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; failures=$((failures + 1)); }

if [[ ! -f $PEER_CONF ]]; then
  echo "Missing $PEER_CONF. Run 'make up' first." >&2
  exit 1
fi

echo "Outside the VPN (host machine)"
if out=$(curl -sS -m 5 "http://$HOST" 2>&1); then
  fail "host reached http://$HOST"
else
  pass "http://$HOST fails from host: ${out}"
fi

echo "Outside the VPN (container on the public edge network)"
outside=$(docker run --rm --network "$EDGE_NET" "$TOOLS_IMAGE" sh -c "
  apk add -q --no-cache bind-tools curl >/dev/null
  status=\$(dig +noall +comments $HOST @1.1.1.1 | grep -o 'status: [A-Z]*')
  echo \"dns:\$status\"
  curl -s -m 5 -o /dev/null http://$APP_IP && echo http:reached || echo http:blocked
" 2>&1)
grep -q 'dns:status: NXDOMAIN' <<<"$outside" \
  && pass "public DNS returns NXDOMAIN for $HOST" \
  || fail "public DNS did not return NXDOMAIN ($outside)"
grep -q 'http:blocked' <<<"$outside" \
  && pass "http://$APP_IP unreachable without the tunnel" \
  || fail "http://$APP_IP reachable without the tunnel"

echo "Inside the VPN (WireGuard client container)"
# The peer file's Endpoint targets the host; inside Docker the gateway is `vpn`.
# The DNS line is dropped because Alpine lacks resolvconf; queries go straight
# to the VPN's DNS server instead.
client_conf=$(sed -e 's/^Endpoint = .*/Endpoint = vpn:51820/' -e '/^DNS/d' "$PEER_CONF")
inside=$(docker run --rm --network "$EDGE_NET" --cap-add NET_ADMIN \
  -e CONF="$client_conf" "$TOOLS_IMAGE" sh -c "
  apk add -q --no-cache wireguard-tools bind-tools curl >/dev/null
  printf '%s\n' \"\$CONF\" > /etc/wireguard/wg0.conf
  wg-quick up wg0 >/dev/null 2>&1 || { echo tunnel:down; exit 0; }
  echo \"dns:\$(dig +short $HOST @$VPN_DNS)\"
  echo \"http:\$(curl -s -m 5 --resolve $HOST:80:$APP_IP http://$HOST | grep -o '<title>[^<]*</title>')\"
" 2>&1)
if grep -q 'tunnel:down' <<<"$inside"; then
  fail "could not bring up the WireGuard tunnel"
else
  grep -q "dns:$APP_IP" <<<"$inside" \
    && pass "$HOST resolves to $APP_IP via VPN DNS" \
    || fail "$HOST did not resolve via VPN DNS ($inside)"
  grep -q 'http:<title>' <<<"$inside" \
    && pass "app responds: $(grep -o '<title>[^<]*</title>' <<<"$inside")" \
    || fail "app did not respond through the tunnel ($inside)"
fi

echo
if (( failures )); then
  echo "$failures check(s) failed."
  exit 1
fi
echo "All checks passed: the app is reachable only through the VPN."
