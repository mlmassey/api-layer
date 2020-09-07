# General/Recommend Usage
The following sample demonstrates a typical usage of the ApiLayer by retrieving and setting user information on your server.  See the file [sample.test.ts](./sample.test.ts) on sample usage.

# Recommendations
The following recommendations are based on usage of ApiLayer in large projects.  You don't have to follow these rules, but it is highly recommended
1. It is recommended to use Typescript, since it allows for easy re-factoring if your api functions change.  
2. Create a folder in your application called `api` that will contain all your ApiLayer functions.  This makes it easy for your back-end team to quickly review the existing apis and update them if there are changes, without having to parse the entire code base.
3. Have a single file that will export the ApiLayer created by called `apiLayerCreate`.  This will be imported in your different API functions.
4. Start your api filenames with `api` to easily identify that they are an api-layer managed function.
5. Include `get` or `set` in your api function name to easily identify the function they perform.
6. In each API file, define a function to make the actual api call, as well as the mock version.  Keeping them in the same file makes it easier to update if there are any changes.
7. Declare the API URL at the top of the file as a `const` so it can be easily modified.  You could also import it from a separate file, since many of your ApiLayer functions will use the same URL resource identifier.
8. Any function that modifies data on your server (such as POST/PUT/DELETE) is considered a `SET` function and should be created using [createSetApi](../../src/createSetApi.ts).  Any function that only gets/reads information from your server (such as GET/POST) is considered a `GET` function and should be created using [createGetApi](../../src/createGetApi.ts).

# Sample Workflow
The sample code you can follow can be found in [sample.test.ts](./sample.test.ts).  This is a Jest unit test, but still demonstrates usage.

## Create your api folder
Create your [api folder](../api) in your project that will hold your api functions.

## Create your ApiLayer
Create your [apiLayer](../api/apiLayer.ts) file that will export your single instance of the ApiLayer.  In this file, it is recommended to check if you are running in your unit test environment to start the ApiLayer in mock mode automatically.  

## Start with mock functions
When development first starts, your back-end team has not settled on the API call signature and the server is not yet ready.  It is recommend that you create your mock ApiLayer function to let your front-end team start developing right away and settle on the necessary parameters/usage for the API call later.  This unblocks your front-end team and allows for you to develop APIs after real world usage to minimize rework by your back-end team.  Your back-end team can come in later and replace the mock functions with the real thing once its ready.  As an example, see [apiGetUserById-tbd.ts](../api/user/apiGetUserById-tbd.ts). *NOTE:* You would not call it `tbd` in your real code (just call it `apiGetUserById.ts`).

## Create your SET APIs
`SET` APIs are very similar to `GET` APIs.  The only real difference is cache invalidation case you are using client-side caching with your ApiLayer.  For an example of this, see the sample.  See the sample [apiSetUser.ts](../api/user/apiSetUser.ts) on how to create your `SET` APIs and create the relationship with the `GET` APIs that are dependent on the same information.

## Create the actual API call
When your back-end team is ready, they can go into the api files and implement the actual calls to your back-end.  The nice thing is that the mock version is still available and usable for your unit testing.  Your back-end team can then take ownership of the ApiLayer and maintaining it, leaving your front-end team happily working on their own code.  If the API function signature changes, Typescript will throw compiler warnings if the function arguments or response data changes, which makes refactoring easy.

## Test using unit tests
ApiLayer allows you to easily test your code because it abstracts the asynchronous API calls and provides default mock implementations.  For a more thorough example of this, see the [Unit Test sample](../testing).