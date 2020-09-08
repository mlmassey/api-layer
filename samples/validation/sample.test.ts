/* eslint-disable import/default */
/* eslint-disable import/no-extraneous-dependencies */
import Ajv from 'ajv';
import { apiLayerCreate, createGetApi } from '../../src';

const ajv = new Ajv();

// Create our apiLayer for testing
const apiLayer = apiLayerCreate({ mockMode: true });

// Create our JSON schema and Typescript interface for our API
interface UserData {
  id: number;
  username: string;
  age: number;
}

// Create our AJV JSON schema for performing the validation
const schema = {
  properties: {
    id: {
      type: 'number',
      minimum: 1,
    },
    username: {
      type: 'string',
      minLength: 8,
      maxLength: 20,
    },
    age: {
      type: 'number',
      minimum: 0,
      maximum: 120,
    },
  },
};

// Create our API function for retrieving the server data
function getUserData(): Promise<UserData> {
  const userData: UserData = {
    id: 1,
    username: 'testuser',
    age: 10,
  };
  return Promise.resolve(userData);
}

function invalidUserData(): Promise<UserData> {
  const invalidData: UserData = {
    id: 0, // This value is invalid
    username: 'testuser',
    age: 10,
  };
  return Promise.resolve(invalidData);
}

function validate(schema: any, func: () => Promise<UserData>): () => Promise<UserData> {
  const validationFunc = (): Promise<UserData> => {
    return func().then((result) => {
      const valid = ajv.validate(schema, result);
      if (!valid) {
        throw 'data invalid';
      }
      return result;
    });
  };
  return validationFunc;
}

// Now create our api function and make sure to include the validator
const apiGetUserData = createGetApi(apiLayer, validate(schema, getUserData), validate(schema, getUserData));
const apiGetUserDataInvalid = createGetApi(
  apiLayer,
  validate(schema, invalidUserData),
  validate(schema, invalidUserData),
);

test('Data validation example', async () => {
  const result = await apiGetUserData();
  expect(result).toMatchObject({
    id: 1,
    username: 'testuser',
    age: 10,
  });
});

test('Data validation with invalid response', () => {
  return apiGetUserDataInvalid().catch((error) => {
    expect(error).toBe('data invalid');
  });
});
