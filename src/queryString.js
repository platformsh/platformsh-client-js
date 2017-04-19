const objectToQueryString = (key, value) => `${key}=${encodeURIComponent(value)}`;

const arrayToQueryString = (key, values) => values.map(value => `${key}=${encodeURIComponent(value)}`).join('&');

export default (params) => {
  const paramsStringArray = Object.keys(params)
    .filter(key => params[key] !== undefined)// Can be 0
    .map(key =>
      (params[key] && Array.isArray(params[key]))
        ? arrayToQueryString(key, params[key])
        : objectToQueryString(key, params[key]));

  return paramsStringArray.join('&').replace(/%20/g, '+');
};
