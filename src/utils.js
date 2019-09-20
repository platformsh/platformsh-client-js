import isNode from "detect-node";

const paramsRegex = /(:[0-z]+)/g;

export const urlParser = (url = "", params = {}, paramDefaults = {}) => {
  const paramsList = url.match(paramsRegex);

  if (!paramsList || !paramsList.length) {
    return url;
  }

  let parsedUrl = url;

  for (let i = 0; i < paramsList.length; i++) {
    const paramName = paramsList[i].substring(1);
    const fieldName = paramDefaults[paramName] || paramName;

    if (params[fieldName]) {
      parsedUrl = parsedUrl.replace(paramsList[i], params[fieldName]);
    }
  }

  return parsedUrl;
};

export const base64Encoder = value => {
  if (isNode) {
    return Buffer.from(value, "latin1").toString("base64");
  }

  return btoa(value);
};

export const base64Decoder = value => {
  if (isNode) {
    return Buffer.from(value, "base64").toString("latin1");
  }

  return atob(value);
};
