import { resolvePath } from '../src/WebMockResolver';

test('resolvePath with no root tests', () => {
  expect(resolvePath('', '/test')).toBe('/test');
  expect(resolvePath('', 'test')).toBe('/test');
  expect(resolvePath('', 'test.json')).toBe('/test.json');
  expect(resolvePath('', 'test/sub/blah')).toBe('/test/sub/blah');
});

test('resolvePath with root tests', () => {
  expect(resolvePath('/test', '/path')).toBe('/test/path');
  expect(resolvePath('test', '/path')).toBe('test/path');
  expect(resolvePath('test', 'path')).toBe('test/path');
  expect(resolvePath('test/', '/path')).toBe('test/path');
  expect(resolvePath('test/', 'path')).toBe('test/path');
});

test('resolvePath with windows path slashes is fixed', () => {
  expect(resolvePath('\\test', '\\path')).toBe('/test/path');
  expect(resolvePath('test', '\\path')).toBe('test/path');
  expect(resolvePath('test', 'path')).toBe('test/path');
  expect(resolvePath('test\\', '\\path')).toBe('test/path');
  expect(resolvePath('test\\', 'path')).toBe('test/path');
  expect(resolvePath('test\\', '/path')).toBe('test/path');
});
