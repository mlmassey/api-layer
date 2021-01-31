# React Query Sample

api-layer and [React Query](https://react-query.tanstack.com/) complement each other very well.  React Query is an excellent
library for working with asynchronous API calls by abstracting the API call into a single async function.  This is 
exactly what the api-layer does also.  The additional benefits of using api-layer with React query are

* The cache age/time can be specified in your ApiFunction so that it is automatically set in React Query.  This way, when
your BE team updates your API definition, they can update the cache age easily without hunting through the FE code.
* The SET apis invalidates member will automatically invalidate all associated GET apis that are used in React Query, so
the developer doesn't need to think about it.

## New Hooks
Two hooks were created that wrap the React Query [useQuery](https://react-query.tanstack.com/reference/useQuery) and
[useMutation](https://react-query.tanstack.com/reference/useMutation).  These hooks are provided purely as examples, and
are not considered fully tested and usable.  That said, feel free to use them.

1. [useGetApi](./hooks/useGetApi.ts): Wraps the [useQuery](https://react-query.tanstack.com/reference/useQuery) api and
allows you to specify the api-layer GET function to use.
2. [useSetApi])./hooks/useSetApi.ts): Wraps the [useMutation](https://react-query.tanstack.com/reference/useMutation) and
will automatically invalidate the associated GET APIs in the onSuccess function.

## How to run the sample

This sample is a simple cra app.  Just type `yarn install`, and then `yarn start`

## Whats in the sample

The sample is a simple app that lists the top dogs by breed and color.  You can filter the list, which will filter using
the BE API.  You will note that using the filter will cause a reload, but if you remove the filters, it will automatically
bring back the full list.  This is because the full list is still in the cache, which represents a cache hit and saves
the BE call.