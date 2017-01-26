const test = require('tape'); // eslint-disable-line
const httpIntercept = require('./index');
const http = require('http');

test.onFinish(() => process.exit(0));

const original = http.request;

test('should do nothing', (t) => {
  t.plan(1);

  const options = {
    hostname: 'google.com',
    port: 80,
    path: '/upload',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };


  const interceptOptions = {
    callback: (newOptions) => {
      t.deepEqual(newOptions, options, 'original and new options should be equal');
      http.request = original;
    },
  };

  httpIntercept(interceptOptions);

  http.request(options);
});

test('should change google bing', (t) => {
  t.plan(1);

  const options = {
    hostname: 'google.com',
    port: 80,
    path: '/upload',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const interceptOptions = {
    searchValue: 'google',
    replaceValue: 'bing',
    callback: (newOptions) => {
      t.equal(newOptions.hostname, 'bing.com', 'original and new options should be equal');
      http.request = original;
    },
  };

  httpIntercept(interceptOptions);

  http.request(options);
});

test('predicate should not change google bing', (t) => {
  t.plan(1);

  const options = {
    hostname: 'google.com',
    port: 80,
    path: '/upload',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const interceptOptions = {
    searchValue: 'google',
    replaceValue: 'bing',
    callback: (newOptions) => {
      t.notEqual(newOptions.hostname, 'bing.com', 'original and new options should be equal');
      http.request = original;
    },
    predicate: () => false,
  };

  httpIntercept(interceptOptions);

  http.request(options);
});

test('should change google bing and com to org', (t) => {
  t.plan(1);
  const interceptOptions = {
    searchAndReplaceValues: [{
      google: 'bing',
    },
    {
      '.com': '.org',
    },
    ],
    callback: (newOptions) => {
      t.equal(newOptions.hostname, 'bing.org', 'original and new options should be equal');
      http.request = original;
    },
  };

  httpIntercept(interceptOptions);

  const options = {
    hostname: 'google.com',
    port: 80,
    path: '/upload',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  http.request(options);
});
