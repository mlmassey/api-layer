# api-layer
api-layer is a very simple API organization library that helps you clearly define an abstraction layer for your API calls to ensure that they are easily mockable or overridden.  You can also easily add a client-side API caching to greatly improve your apps performance.  It has no dependencies and supports Typescript and Javascript.  

# Installation
Using npm:
```
$ npm i --save api-layer
```
Using yarn:
```
$ yarn add api-layer
```

# Justification
Working on many large projects, most teams are split into back-end and front-end development teams.  Typically, the two teams agree on RESTful API definitions and directly call the APIs using libraries such as `fetch` or `Axios`.  Over time though, APIs may change parameters or add functionality, so someone has to update each API call in the front-end code to handle the new API signature.  Additionally, during initial development, the front-end code will fail until the actual server/API call is available, so front-end developers will typically stub or mock the API until it is actually ready.  The api-layer library was created to formalize this process and create a clearly defined abstraction layer for handling API calls, so your application always handles APIs in a standardized methodology that allows for easy mocking and testing.  You can also add front-end API caching easily and simply using any 3rd party memoization function of your choosing.

# Features
1. Abstract all your API calls with a `GET` or `SET` asynchronous function.  Your code now calls the abstracted functions instead of directly making API calls
2. Easily update the API calls, since all of your front-end code calls the abstracted functions.  You can change/update the actual call to your back-end without changing your front-end code.
3. Create mock versions of your api, so all of your functions will have a test/mock version that does not need your back-end to work.  This is useful for early development or unit testing purposes.
4. You can override your api-layer functions during run-time, allowing you to perform dependency injection at the API layer and swap out functionality as needed.  Very useful for unit testing purposes.
5. Supports client-side API caching using any 3rd party caching/memoization library that you want to use. 
6. Perform data validation on API responses using any 3rd party library that you want to use.  This is not directly supported in the api-layer, but sample code is provided.  

# Samples
A number of sample implementations have been provided so you can understand how to use the api-layer and enhance it with additional functionality. It is recommended to follow the implementation in the General and Recommend Usage in your application. 
1. [General and Recommend Usage](./samples/general)
2. [Testing and Overrides](./samples/testing)
3. [Client-side API caching](./samples/caching)
4. [Validating API responses](./samples/validation)
5. [Web Application Usage](./samples/webapp)
## React Query Sample
[React Query](https://react-query.tanstack.com/) is an excellent library for managing your asynchronous API calls in your application.  Its conceptually aligned with api-layer and the two work seamlessly together to work with your BE and manage the API cache.  Take a look at the sample for more details.  [React Query Sample](./samples/react-query-sample)
# Typescript Types
Typescript types can be directly imported from the library. There should be no need to install separate type definitions.

# CommonJS/ES Modules
This library provides both ESM and CommonJS builds.  You should not need to worry about this, but in case you want to specifically use
one or the other, you can do the following:

## CommonJS
```javascript
var ApiLibrary = require('api-library/lib/cjs');
```

## ESM
```javascript
import { createGetApi } from 'api-library/lib/esm';  
```

