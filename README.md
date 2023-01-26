This repository has examples of [Trigger.dev](https://trigger.dev) being used.

## Installation

```sh
git clone https://github.com/triggerdotdev/trigger.dev-examples.git
cd trigger.dev-examples
npm install
```

## API key

Sign up at [Trigger.dev](https://trigger.dev) and get your API Key. We have a generous free trial.

Create a `.env` file in the root of this project and add your API Key:

## Run an example

There are lots of examples in this repository. Each example is in a file and has a separate run command in the `package.json` file.

Run an example with your API Key as an env variable (or add a `.env` file to the project root):

```sh
TRIGGER_API_KEY="trigger_development_vzNnO2DGBGcG" npm run github # see package.json for more
```
