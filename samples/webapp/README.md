# api-layer Sample WebApp

This is a small/sample web application that demonstrates how you can run the api-layer in both a web and node/jest
environment in your project.  In my projects, I would typically using the mocking of the api-layer in my Jest unit tests and
in [Storybook JS](https://storybook.js.org), so we can test our application components without the need of a 
back-end.  When running in the web, your application no longer has access to your development file system, so you need
copy all the mock files to your web server.  This is demonstrated using the [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) and the [CopyWebpackPlugin](https://webpack.js.org/plugins/copy-webpack-plugin/)
within the sample [webpack.config.js](./webpack.config.js) provided.

# How to install the sample
As usual, run `npm i` or `yarn install`.

# How to run the sample
1. Run `yarn dev` or `npm run dev` to run the application in development, which runs with mockMode on and returns mock results
2. Run `yarn prod` or `npm run prod` to run the application in production, which runs with mockMode off
3. Run `yarn test` to run Jest unit tests to demonstrate using the same APIs in unit tests

