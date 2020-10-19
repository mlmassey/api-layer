# General/Recommend Usage
The following sample demonstrates a typical usage of the ApiLayer by retrieving and setting user information on your server.  See the file [sample.test.ts](./sample.test.ts) on sample usage.

# Recommendations
The following recommendations are based on usage of api-layer in large projects.  You don't have to follow these rules, but it is highly recommended
1. It is recommended to use Typescript, since it allows for easy re-factoring if your api functions change.  
2. Create a folder in your application called `api` that will contain all your ApiLayer functions.  This makes it easy for your back-end team to quickly review the existing apis and update them if there are changes, without having to parse the entire code base.
3. Have a single file that will create the global instance of the ApiLayer created by calling `apiLayerCreate`.  You import it at the start
of your application, or you can import it in each individual api javascript file to ensure its called first and only once.
4. Start your api filenames with `api` to easily identify that they are an api-layer managed function.
5. Any function that modifies data on your server (such as POST/PUT/DELETE) is considered a `SET` function and should be created using [createSetApi](../../src/createSetApi.ts).  Any function that only gets/reads information from your server (such as GET/POST) is considered a `GET` function and should be created using [createGetApi](../../src/createGetApi.ts).
6. Include `Get` or `Set` in your api function name to easily identify the function they perform.
7. Declare the API URL at the top of the file as a `const` so it can be easily modified.  You could also import it from a separate file, since many of your ApiLayer functions will use the same URL resource identifier.
8. It is recommended to end your mock files with `.mock.js` or `.mock.json`.  
9. It is recommended to create a folder for each api.  The folder would contain the implementation, the mock file, and the JSON schema for 
validation.  This keeps related files close together so they are easier to notice.  Another idea is to put all mock files in a `mock` folder,
but developers tend to forget to update these filenames since its not next to the implementation.

# Sample Workflow
The sample code you can follow can be found in [sample.test.ts](./sample.test.ts).  This is a Jest unit test, but still demonstrates usage.

## Create your api folder
Create your [api folder](../api) in your project that will hold your api functions.

## Create your ApiLayer
Create your [apiLayer](../api/apiLayer.ts) file that will call `apiLayerCreate` and install the global api layer.  Typically, this would be your web application, which requires you to use the [WebMockResolver](../../src/WebMockResolver.ts).  For example on how to do this, check 
out the [sample web application](../webapp).  For more information on MockResolvers, see the section below.

## Start with mock functions
When development first starts, your back-end team has not settled on the API call signature and the server is not yet ready.  It is recommend that you create your mock ApiLayer function to let your front-end team start developing right away and settle on the necessary parameters/usage for the API call later.  This unblocks your front-end team and allows for you to develop APIs after real world usage to minimize rework by your back-end team.  Your back-end team can come in later and replace the mock functions with the real thing once its ready.  As an example, see [apiGetUserById-tbd.ts](../api/user/apiGetUserById/apiGetUserById-tbd.ts). *NOTE:* You would not call it `tbd` in your real code (just call it `apiGetUserById.ts`).

### Creating mock response files
You will want to create an API response that is a typical/positive response for the API call.  This will allow your tests or application to run
in a normal way that makes sense for your application.  This way, developers don't need to continually add new mock values for functions
that they do not care about when testing/developing other parts of your application.  

There are three types of responses currently supported (although you can add more by creating your own MockResolver).
1. String data: Just have your file contain UTF-8 string data.  Just don't use *.json or *.js extensions for these files.
2. JSON data: Create standard JSON response files and use the file extension *.json.  The MockResolver will return a Javascript object to our calling functions.
3. Javascript functions: If you need your mock function to provide different responses based on the inputs, you can use vanilla Javascript
functions that are exported using `module.exports =`.  Note that you should not import/require other files, since this is not supported
with the current MockResolvers provided.  
*WARNING*: It is highly recommended to not use Javascript mock implementations, since its not secure.  The MockResolver provided uses
`eval` to parse the Javascript data, which is a very easy way to inject malicious code into your application.  

## Create your SET APIs
`SET` APIs are very similar to `GET` APIs.  The only real difference is cache invalidation case you are using client-side caching with your ApiLayer.  For an example of this, see the sample.  See the sample [apiSetUser.ts](../api/user/apiSetUser/apiSetUser.ts) on how to create your `SET` APIs and create the relationship with the `GET` APIs that are dependent on the same information.  Even if you're not using caching,
its a good idea to create the dependency between your SET/GET APIs using the `invalidates` parameter, so its clear to developers and you 
can easily add caching later.

## Create the actual API call
When your back-end team is ready, they can go into the api files and implement the actual calls to your back-end.  The nice thing is that the mock version is still available and usable for your unit testing.  Your back-end team can then take ownership of the ApiLayer and maintaining it, leaving your front-end team happily working on their own code.  If the API function signature changes, Typescript will throw compiler warnings if the function arguments or response data changes, which makes refactoring easy.

## Test using unit tests
ApiLayer allows you to easily test your code because it abstracts the asynchronous API calls and provides default mock implementations.  For a more thorough example of this, see the section [Testing and Overrides](../testing).

# MockResolver
The api-layer resolves your mockPath values in your GET/SET APIs using the MockResolver you provide when creating your ApiLayer using [apiLayerCreate](../../src/ApiLayerCommon.ts).  MockResolver is designed to be a base class that is sub-classed by an actual implementation.
Effectively, what the api-layer needs is the `resolve` function, that resolves an `ApiFunction` into a `Promise<any>`.  You can create your
own MockResolver or resolver function, or use the one's provided.
1. [NodeMockResolve](../../src/NodeMockResolver.ts): Resolver for use in your Node application or Jest unit test environment.
2. [WebMockResolver](../../src/WebMockResolver.ts): Resolver for use in your web application environment.
3. [MockResolver](../../src/MockResolver.ts): If you want to create your own resolver, use the provided `MockResolver` base class and extend it