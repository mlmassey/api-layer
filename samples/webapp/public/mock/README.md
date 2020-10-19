# Mocks in your /public folder
One idea for your mock organization is to place them all in a `mock` folder in your webapp's public folder
The advantage of this is that you don't have to use the WebpackCopyPlugin to copy your mock files over, so
your builds will be faster and less copies when running the webpack-dev-server.  You just want to make 
sure the mock files are not present in your production instance.