import { apiSampleGet } from './api/apiSampleGet';
import './api/webApiLayer';

console.log('Executing apiSampleGet...');
apiSampleGet().then((response) => {
  console.log('Received: ', response);
  const expected = process.env.NODE_ENV === 'development' ? 'Mock sampleGet response' : 'Production sampleGet response';
  if (response !== expected) {
    console.error(`Expected: "${expected}`);
  } else {
    console.log('SUCCESS!');
  }
});
