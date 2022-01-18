const paramsRegex = /(:[0-z]+)/g;

export default (url = "", params: Record<string, string> = {}, paramDefaults: Record<string, string> = {}) => {
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
