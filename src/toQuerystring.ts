export type Options = {
  arrayPrefix?: string;
};

export type Param = string | number | boolean | object | Param[];
export type Params = Param[] | Record<string, Param>;

// Bundle size optimisation
const euc = encodeURIComponent;

const keyValueToQueryString = (
  key: string,
  value: Record<string, Param> | Param,
  queryString: string,
  isArray: boolean,
  options: Options
) => {
  const arrayPrefix = isArray ? options.arrayPrefix ?? "" : "";

  if (typeof value === "object") {
    const tmpQueryString = `${key}${arrayPrefix}${queryString && "]"}[`;

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return `${objectToQueryString(
      value as Record<string, Param>,
      `${queryString}${tmpQueryString}`,
      options
    )}`;
  }

  if (queryString?.length) {
    return `${queryString}${key}]${arrayPrefix}=${euc(value)}`;
  }

  return `${key}${arrayPrefix}=${euc(value)}`;
};

const arrayToQueryString = (
  key: string,
  values: (Params | Param)[],
  queryString: string,
  options: Options
) =>
  values
    .map(value => keyValueToQueryString(key, value, queryString, true, options))
    .join("&");

const objectToQueryString = (
  params: Params,
  queryString = "",
  options: Options = {}
) => {
  let paramsStringArray: string[] = [];

  if (Array.isArray(params)) {
    paramsStringArray = params.map((value, index) =>
      keyValueToQueryString(`${index}`, value, queryString, true, options)
    );
  } else {
    paramsStringArray = Object.keys(params)
      .filter(key => params[key] !== undefined) // Can be 0
      .map(key =>
        params[key] && Array.isArray(params[key])
          ? arrayToQueryString(
              `${key}`,
              params[key] as (Params | Param)[],
              queryString,
              options
            )
          : keyValueToQueryString(key, params[key], queryString, false, options)
      );
  }
  return paramsStringArray.join("&").replace(/%20/gu, "+");
};

export default objectToQueryString;
