/* eslint-disable import/default */
/* eslint-disable import/no-extraneous-dependencies */
import Ajv from 'ajv';
import { apiLayerCreate, createGetApi } from '../../src';
import { NodeMockResolver } from '../../src/NodeMockResolver';

// Create the global api layer in production mode
const mockResolver = new NodeMockResolver();
apiLayerCreate({ mockResolver });

const ajv = new Ajv();

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
const apiGetUserData = createGetApi(validate(schema, getUserData), 'mock is never called so this is ignored');
const apiGetUserDataInvalid = createGetApi(
  validate(schema, invalidUserData),
  'mock is never called so this is ignored',
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
