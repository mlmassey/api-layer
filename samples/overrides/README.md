# Overriding
The following sample demonstrates using the ApiLayer to override API functionality during run-time of your application.  See the file [sample.test.ts](./sample.test.ts) for the sample code.

# Overriding APIs
Typically, you would only use overrides in your test code for testing different conditions.  You can see samples of thing in [Unit Testing](../testing).  ApiLayer does not limit this functionality to just unit testing though.  You will need to be careful using this functionality though, since you can only have one override installed at a time and installing a new override will replace the previously installed override.