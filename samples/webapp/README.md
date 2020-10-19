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

# Implementation Notes
1. You will need to use the [WebMockResolver](../../src/WebMockResolver.ts) in your web application.  You should set the `rootPath` to the root location
of where the mock files will be on your web server.  If not set, it defaults to the `/`.  You can see an example of using
the `CopyWebpackPlugin` in the provided [webpack.config.js](./webpack.config.js).
2. Your Jest unit tests need to use the [NodeMockResolver](../../src/NodeMockResolver.ts) to access your file system.  You need to
set the `rootPath` also.  It defaults to your projects root using `process.cwd`, but the example shows it using the `__dirname`.
3. *WARNING*: It is important that you don't accidentally run the api-layer with mockMode=true in production and/or copy the mock
files in production. 
4. *WARNING2*: It is recommended that you use JSON for your mock responses, rather than Javascript.  Since api-layer uses [eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval), if 
somehow someone was able to change the mock implementation, it could cause the code to run in your application environment.
