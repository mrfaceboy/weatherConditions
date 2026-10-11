# Weather Conditions

A small TypeScript web app that shows the current weather for a city, ZIP code, or set of coordinates, using the OpenWeatherMap API. It's bundled with webpack and served by nginx in a Docker container.



## Running locally

```sh
make install   # install npm dependencies
make dev       # dev server at http://localhost:8080
```

## Deployment

The app runs on a private Docker network that can only be reached through a WireGuard VPN, at http://weather.internal. Start everything with `make up`, then import the generated VPN config into your WireGuard client. Run `make help` to see all targets.

The [deployment guide](deploy/README.md) covers the architecture, setup steps, verification, and troubleshooting.

## How to use the App

once running the app and going to the page, you will see 3 sets of text input. Fill out one of of any of the forms to search by city, zipcode, or coordinates. hitting submit will display the data back from OpenWeatherMap in plain text in a readable format.

### Where I used AI

As I have not built an app from scratch in quite some time. I used AI to help me setup the initial app and getting the required inports to get the basic app running. I then wrote the majority of the code myself with a few exceptions:

1. Some google AI powered searching for some basic functionality. I did have it write a convoluted way to determine if a variable was an object but it turned out to be not needed.
2. Some CSS updates as I wanted a specific formatting and wanted to see if it has some good suggestions.
3. The openWeatherMap current api (4.0) requires a creditcard entry for the subscription to use. it is free for 1000 calls which I would not susspect ever hitting, but still feels strange of a requirement. I hade Claude help me find an ealier version (2.5) that did not require a subscription to hit the api
4. setting up the vpn and build proccess. I have never setup one from scratch before. I wanted to be sure to make it as clean and free as possibly, so I had claude give me options, and then setup the one that best fit the criteria for the task. Made for some interesting build flow.