# ERC 721 Wrapper/Unwrapper Service

A rudimentary bridge leveraging Alchemy webhooks built in NodeJS. On webhook triggers, the signature is verified. Upon success & necessary block confirmations, the asset is wrapped/unwrapped as requested. Gets the job done, and is safe enough implementation for the values of the assets being transferred. Users only interact with unwrapping.

## Installation

#### Simple setup

First, install Yarn if you don't have it:

```
npm install -g yarn
```

Then, install the dependencies of all packages:

```
yarn
```

## Run

To run

```
yarn start
```
