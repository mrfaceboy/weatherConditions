# Deployment: private network + VPN

The app runs on a private Docker network with no inbound route. The only way to
reach it is through a WireGuard VPN gateway. Everything runs locally with
Docker, so no cloud account is needed.

## Architecture

```
  Your machine                        Docker
 ┌───────────────┐   UDP 51820   ┌────────────────────────────────────────────┐
 │ WireGuard     │──────────────▶│ edge network (bridge)                      │
 │ client        │   encrypted   │   └─ vpn  WireGuard gateway + CoreDNS      │
 │ 10.13.13.2    │    tunnel     │          10.13.13.1 (tunnel side)          │
 └───────────────┘               │                │                           │
                                 │ private network 10.200.0.0/24 (internal)   │
                                 │   ├─ vpn  10.200.0.x                       │
                                 │   └─ web  nginx, 10.200.0.10               │
                                 │           alias: weather.internal          │
                                 └────────────────────────────────────────────┘
```

- **`private` network.** Marked `internal: true`, so it has no gateway and no
  NAT, and nothing on it can be reached from the host or the internet. The
  `web` container publishes no ports.
- **`vpn` gateway.** The only container on both networks, and the only
  published port (`51820/udp`). It forwards tunnel traffic into `private`.
- **DNS.** `weather.internal` is a Docker network alias, so it exists only in
  Docker's internal DNS. VPN clients query it through the gateway's CoreDNS at
  `10.13.13.1`. Off the VPN the name doesn't exist (NXDOMAIN). `.internal` is
  the top-level domain ICANN reserves for private use, so it never resolves
  publicly.
- **Split tunnel.** Only `10.13.13.0/24` and `10.200.0.0/24` go through the
  VPN. Other traffic, including the browser's calls to the OpenWeatherMap API,
  goes out normally.

## Prerequisites

- Docker Desktop, or Docker Engine with Compose v2
- A WireGuard client:
  - macOS / iOS: the "WireGuard" app from the App Store
  - Windows / Android: https://www.wireguard.com/install/
  - Linux: `wireguard-tools` (`sudo apt install wireguard-tools`)

## 1. Start the environment

From the repository root:

```sh
make up
```

This builds the app image, creates both networks, and starts the containers.
On first run, the gateway generates keys and a client config at:

```
deploy/wireguard/peer_reviewer/peer_reviewer.conf
```

This file is the **VPN configuration file**. It contains a private key, so it
is gitignored and generated fresh for each environment.

**Connecting from another machine:** by default the config's endpoint is
`127.0.0.1`, which only works on the machine running Docker. To connect from
another device on your network, pass the host's LAN IP:

```sh
make clean               # discards keys generated for the old endpoint
make up SERVERURL=192.168.1.20
```

## 2. Confirm the app is NOT reachable without the VPN

With the VPN disconnected:

```sh
$ curl http://weather.internal
curl: (6) Could not resolve host: weather.internal

$ dig weather.internal +noall +comments | grep status
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: ...
```

Opening http://weather.internal in a browser fails with
`DNS_PROBE_FINISHED_NXDOMAIN`.

## 3. Connect to the VPN

**WireGuard app (macOS / Windows):** click *Import tunnel(s) from file*, choose
`peer_reviewer.conf`, then *Activate*.

**Command line (Linux / macOS with wireguard-tools):**

```sh
sudo wg-quick up ./deploy/wireguard/peer_reviewer/peer_reviewer.conf
```

## 4. Open the app

Browse to **http://weather.internal**.

To disconnect, deactivate the tunnel in the app, or run
`sudo wg-quick down ./deploy/wireguard/peer_reviewer/peer_reviewer.conf`.

## Automated verification

```sh
make verify
```

This runs [verify.sh](verify.sh), which checks both sides of the boundary
without needing a WireGuard client on the host:

```
Outside the VPN (host machine)
  PASS http://weather.internal fails from host: curl: (6) Could not resolve host: weather.internal
Outside the VPN (container on the public edge network)
  PASS public DNS returns NXDOMAIN for weather.internal
  PASS http://10.200.0.10 unreachable without the tunnel
Inside the VPN (WireGuard client container)
  PASS weather.internal resolves to 10.200.0.10 via VPN DNS
  PASS app responds: <title>Weather Conditions</title>

All checks passed: the app is reachable only through the VPN.
```

The in-VPN check uses a separate `verify` peer, so it won't disconnect a
reviewer who is already connected.

## Make targets

| Target            | What it does                                           |
| ----------------- | ------------------------------------------------------ |
| `make up`         | Build and start the network, app, and VPN gateway      |
| `make verify`     | Prove the app is reachable only through the VPN        |
| `make vpn-config` | Print the reviewer's WireGuard client config           |
| `make logs`       | Follow container logs                                  |
| `make down`       | Stop and remove the containers and networks            |
| `make clean`      | `down`, then delete generated VPN keys                 |

## Files

| File                       | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `../Dockerfile`            | Multi-stage build: Node compiles the app, nginx serves it    |
| `docker-compose.yml`       | Networks, the app, and the VPN gateway                       |
| `peer.conf.template`       | Client config template, seeded into the gateway by `make up` |
| `verify.sh`                | Automated reachability checks                                |
| `wireguard/` (generated)   | Server and peer keys; gitignored                             |

## Troubleshooting

- **The tunnel connects, but `weather.internal` doesn't resolve.** The client
  isn't using the VPN's DNS. Check that the config has `DNS = 10.13.13.1`, or
  test with `dig @10.13.13.1 weather.internal`.
- **"Address already in use" when activating the tunnel.** Another WireGuard
  config on the machine is bound to port 51820. Deactivate it first.
- **Peer config missing after `make up`.** Run `make logs` and check the `vpn`
  container's output. The gateway needs the `NET_ADMIN` capability and kernel
  WireGuard support, which Docker Desktop and Linux kernels 5.6+ include.
