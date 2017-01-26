const _ = require('lodash');
const http = require('http');
const memoize = require('fast-memoize');

const fields = [
  'uri.host',
  'uri.hostname',
  'uri.href',
  'uri.path',
  'uri.pathname',
  'host',
  'hostname',
  'href',
  'path',
];

/**
 * @function http-intercept
 * @description intercepts http requests and overwrites the options.
 * @param {Object} options - the options for the http intercept.
 * @param {string} options.searchValue - a single search value.
 * @param {string} options.replaceValue - a single replace value.
 * @param {string} options.searchAndReplaceValues - an array of search and replace values
 * @param {array} options.searchAndReplaceValues - an array of search and replace values
 * @param {function} options.callback - notifies with the replaced arguments that a
 *  http request is about to execute
 * @param {function} options.predicate - a replacment will only occur it this function
 *  returns truthy

 */
module.exports = (moduleOptions) => {
  if (!_.isObject(moduleOptions)) throw new Error('options should be an object;');
  const iterceptOptions = Object.assign({}, moduleOptions);

  const searchAndReplaceValues = [];
  if (!_.isNil(iterceptOptions.searchAndReplaceValues) &&
    _.isArray(iterceptOptions.searchAndReplaceValues)) {
    searchAndReplaceValues.push(...iterceptOptions.searchAndReplaceValues);
  }

  if (_.isString(iterceptOptions.searchValue) &&
    _.isString(iterceptOptions.replaceValue) &&
    !_.isNil(iterceptOptions.searchValue) &&
    !_.isNil(iterceptOptions.replaceValue)) {
    const searchAndReplaceValue = {};
    searchAndReplaceValue[iterceptOptions.searchValue] = iterceptOptions.replaceValue;
    searchAndReplaceValues.push(searchAndReplaceValue);
  }


  const iterceptPredicate = !_.isNil(iterceptOptions.predicate) &&
    _.isFunction(iterceptOptions.predicate) ? iterceptOptions.predicate : null;


  /**
   * @function replaceOptions
   * @description Replaces the http request options with the searchAndReplaceValues.
   * @param {Object} options
   * @returns new options that are replaced with searchAndReplaceValues.
   */
  const replaceOptions = (options) => {
    const newOpts = Object.assign({}, options);
    if (iterceptPredicate !== null && !iterceptPredicate(newOpts)) return newOpts;
    console.log('expensive');

    fields.forEach((field) => {
      const originalValue = _.get(newOpts, field);
      let currentValue = originalValue;
      if (!currentValue || typeof currentValue !== 'string') return;
      searchAndReplaceValues.forEach((searchReplace) => {
        const searchValue = Object.keys(searchReplace)[0];
        const replaceValue = searchReplace[searchValue];
        currentValue = currentValue.replace(searchValue, replaceValue);
        if (currentValue !== originalValue) {
          _.set(newOpts, field, currentValue);
        }
      });
    });
    return newOpts;
  };

  const replaceOptionsMemoized = memoize(replaceOptions);


  const old = http.request;
  /**
   * @function http.request
   * @description intercepts http requests, replace the options and then executes the
   * original function with those options
   * @param {any} options
   * @param {any} callback
   * @returns the result of the original http.request
   */
  http.request = (options, callback) => {
    const newOpts = replaceOptionsMemoized(options);

    if (!_.isNil(iterceptOptions.callback) &&
      _.isFunction(iterceptOptions.callback)) {
      iterceptOptions.callback(newOpts);
    }

    return old(newOpts, callback);
  };
};
