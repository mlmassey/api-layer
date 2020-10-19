import { apiGetSample } from './api/apiGetSample';
import { apiSetSample } from './api/apiSetSample';
import './api/apiLayer';

function setSample() {
  console.log('Executing apiSetSample...');
  return apiSetSample()
    .then(() => {
      console.log('SUCCESS!');
    })
    .catch((error) => {
      console.error('apiSetSample: ', error);
    });
}

console.log('Executing apiGetSample...');
apiGetSample().then((response) => {
  console.log('Received: ', response);
  const expected = process.env.NODE_ENV === 'development' ? 'Mock sampleGet response' : 'Production sampleGet response';
  if (response !== expected) {
    console.error(`Expected: "${expected}`);
  } else {
    console.log('SUCCESS!');
  }
  return setSample();
});
