const test = require('tape');
const httpIntercept = require('./index');
const http = require('http');
test.onFinish(() => process.exit(0));

const original = http.request;

test('should do nothing', function (t) {
  t.plan(1);
  const interceptOptions = {
    callback: (newOptions) => {
      t.deepEqual(newOptions, options, 'original and new options should be equal');
      http.request = original;
    }
  }

  httpIntercept(interceptOptions);

  const options = {
    hostname: 'google.com',
    port: 80,
    path: '/upload',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };

  http.request(options);
});

test('should change google bing', function (t) {
  t.plan(1);
  const interceptOptions = {
    searchValue: 'google',
    replaceValue: 'bing',
    callback: (newOptions) => {
      t.equal(newOptions.hostname, 'bing.com', 'original and new options should be equal');
      http.request = original;
    }
  }

  httpIntercept(interceptOptions);

  const options = {
    hostname: 'google.com',
    port: 80,
    path: '/upload',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };

  http.request(options);
});

test('predicate should not change google bing', function (t) {
  t.plan(1);
  const interceptOptions = {
    searchValue: 'google',
    replaceValue: 'bing',
    callback: (newOptions) => {
      t.notEqual(newOptions.hostname, 'bing.com', 'original and new options should be equal');
      http.request = original;
    },
    predicate: (options) => {
      return false;
    },
  }

  httpIntercept(interceptOptions);

  const options = {
    hostname: 'google.com',
    port: 80,
    path: '/upload',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };

  http.request(options);
});

test('should change google bing and com to org', function (t) {
  t.plan(1);
  const interceptOptions = {
    searchAndReplaceValues: [{
        'google': 'bing'
      },
      {
        '.com': '.org'
      },
    ],
    callback: (newOptions) => {
      t.equal(newOptions.hostname, 'bing.org', 'original and new options should be equal');
      http.request = original;
    }
  }

  httpIntercept(interceptOptions);

  const options = {
    hostname: 'google.com',
    port: 80,
    path: '/upload',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };

  http.request(options);
});

/* @function http-intercept
 * @description intercepts http requests and overwrites the options.
 * @param {Object} options - the options for the http intercept.
 * @param {string} options.searchValue - a single search value.
 * @param {string} options.replaceValue - a single replace value.
 * @param {string} options.searchAndReplaceValues - an array of search and replace values
 * @param {array} options.searchAndReplaceValues - an array of search and replace values
 * @param {function} options.callback - notifies with the replaced arguments that a http request is about to execute
 * @param {function} options.predicate - a replacment will only occur it this function returns truthy
 * */