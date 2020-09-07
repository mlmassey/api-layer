# api-layer
api-layer is a very simple API management library that helps you clearly define an abstraction layer for your API calls to ensure that they are easily mockable or overridden.  It has no dependencies and fully supports Typescript and Javascript.  

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
Working on many large projects, most teams are split into back-end and front-end development.  Typically, the two teams agree on RESTful API definitions and directly call the APIs using libraries such as fetch or Axios.  Over time though, APIs may change parameters or add functionality, so someone has to update each API call in the front-end code to handle the new API signature.  Additionally, during initial development, the front-end code will fail until the actual server/API call is available, so front-end developers will typically stub or mock the API until it is actually ready.  The api-layer library was created to formalize this process and create a clearly defined abstraction layer for handling API calls, so your application always handles APIs in a standardized methodology that allows for easy mocking and testing.  You can also add front-end API caching easily and simply using any 3rd party memoization function of your choosing.

# Features
1. Abstract all your API calls with a `GET` or `SET` asynchronous function.  Your code now calls the abstracted functions instead of directly making API calls
2. Easily update the API calls, since all of your front-end code calls the abstracted functions.  You can change/update the actual call to your back-end without changing your front-end code.
3. The api-layer functions require a mock version be created, so all of your functions will have a test/mock version that does not need your back-end to work.  This is useful for early development or unit testing purposes.
4. You can override your api-layer functions during run-time, allowing you to perform dependency injection at the API layer and swap out functionality as needed.  Very useful for unit testing purposes.
5. Supports API caching using any 3rd party caching/memoization library that you want to use.  This functionality is simply supported in the api-library by adding a `clear()` function to your API abstraction function.
6. Perform data validation on API responses using any 3rd party library that you want to use.  This is not directly supported in the api-layer, but sample code is provided.  

# Typical Workflow
## Create an api folder
It's recommended that you create a folder you in your project called `/api` that will house all your external RESTful API calls.  

## Create the ApiLayer
Create a global ApiLayer that you will import into your other API functions.  For example, create `/api/apiLayer.js` with the following sample contents 
```javascript
import { apiLayerCreate } from 'api-layer';
export default apiLayerCreate();
```

## Create your API function
Create a sample API function called `/api/getSample.js`.
```javascript
import { createGetApi } from 'api-layer';
import apiLayer from './apiLayer';

function getSample() {
  // This sample uses fetch to make a REST API call
  return fetch('https://api.github.com/emojis')
    .then(response => response.json());
}

function getSampleMock() {
  return new Promise((resolve) => {
    resolve({
      smiley: "https://github.githubassets.com/images/icons/emoji/unicode/1f603.png?v8"
    });
  });
}

export default createGetApi(apiLayer, getSample, getSampleMock);
```

## Call your new API function
You can now call your abstract function instead of directly fetching the resource from the URL.  
```javascript
import getSample from '/api/getSample';

getSample()
  .then((result) => {
    console.log('Here are GitHub's emojis: ', result);
  });
```

## Test your API function in Jest
Its simple to test your functions because you can put the whole ApiLayer into `mock` mode.  Since all your API functions are required to have mock results for testing, you can be assured that you can easily test your higher level code with the sample response.
```javascript
import getSample from '/api/getSample';
import apiLayer from '/api/apiLayer';

// Sets your ApiLayer into mock/test mode
apiLayerMockMode(apiLayer, true);

test('Test my getSample function', async () => {
  // Result will contain the value returned in your getSampleMock() function and does not actually require an Internet connection
  // or to talk to the GitHub servers, making your tests repeatable and fast
  const result = await getSample();
  expect(typeof result).toBe('object');
});
```

You can also override the APIs to return a different result for testing purposes
```javascript
import { overrideApi } from 'api-layer';
import getSample from '/api/getSample';
import apiLayer from '/api/apiLayer';

// Sets your ApiLayer into mock/test mode
apiLayerMockMode(apiLayer, true);

// Create a function that will reject with an error to test your codes negative test case handling
function errorResult() {
  return Promise.reject('my error');
}

test('Test error handling in my code', () => {
  overrideApi(apiLayer, getSample, errorResult);
  return getSample().catch((error) => {
    expect(error).toBe('my error');
  });
});
```

## Update your API without changing your Front-end code
Your back-end team decided to move the API end-point for emojis to a new location.  That's no problem.  They can now go into the front-end code and find any occurrence in your `api` folder and update it without having to notify the front-end team.  They update `/api/getSample` to:
```javascript
import { createGetApi } from 'api-layer';
import apiLayer from './apiLayer';

function getSample() {
  // Call the new v2 api and modify the result to match the original getSample interface
  return fetch('https://api.github.com/v2/emojis')
    .then(response => response.json())
    .then((json) => {
      // Now our json looks like { emojis, images }, so we update the response back
      return json.emojis;
    });
}

function getSampleMock() {
  return new Promise((resolve) => {
    resolve({
      smiley: "https://github.githubassets.com/images/icons/emoji/unicode/1f603.png?v8"
    });
  });
}

export default createGetApi(apiLayer, getSample, getSampleMock);
```

# Samples
A number of sample implementations have been provided so you can understand how to use the api-layer and enhance it with additional functionality.  
1. General and Recommend Usage
2. Unit testing
3. Overriding Apis
4. Creating a cached API layer
5. Validating api responses

