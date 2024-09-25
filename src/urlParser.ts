const paramsRegex = /(:[0-z]+)/gu;

export const urlParser = (
  url = "",
  params: Record<string, string> = {},
  paramDefaults: Record<string, string> = {}
) => {
  const paramsList = url.match(paramsRegex);

  if (!paramsList?.length) {
    return url;
  }

  let parsedUrl = url;

  for (const param of paramsList) {
    const paramName = param.substring(1);
    const fieldName = paramDefaults[paramName] || paramName;

    if (params[fieldName]) {
      parsedUrl = parsedUrl.replace(param, params[fieldName]);
    }
  }

  return parsedUrl;
};
