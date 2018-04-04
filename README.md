# app

> A Vue.js project

## Build Setup

Requires Yarn: `npm i -g yarn`
Requires Parity, see: https://wiki.parity.io/Setup

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:8080
yarn dev

# build for production with minification
yarn build

# build for production and view the bundle analyzer report
yarn build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


## Development

```bash
# run parity-cli seperately at localhost:8545 with local dev chain
parity --config dev-insecure --jsonrpc-cors http://localhost:8080 --fat-db=on

# serve with hot reload at localhost:8080
yarn dev
```

