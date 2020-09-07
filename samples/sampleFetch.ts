// This is a mock fetch function to demonstrate our sample code
// You would replace it with a real fetch/Axios function for making api calls

export function sampleFetch(url: string, options: any) {
  return Promise.resolve({
    json: () => {
      return options.response;
    },
  });
}
