import request from "./api";

export const makeAbsoluteUrl = (relativeUrl, _baseUrl) => {
  return `${_baseUrl}${relativeUrl}`;
};

export const hasLink = (links, rel) => {
  return links && links[rel] && links[rel].href;
};

export const getLink = (links, rel, absolute = true, baseUrl) => {
  if (!hasLink(links, rel)) {
    throw new Error(`Link not found: ${rel}`);
  }

  let _url = links[rel].href;

  if (absolute && _url.indexOf("//") === -1) {
    _url = makeAbsoluteUrl(_url, baseUrl);
  }

  return _url;
};

// Load a single object from the ref API
export const getRef = async (
  links,
  linkKey,
  constructor,
  absolute = true,
  baseUrl
) => {
  const obj = await request(getLink(links, linkKey, absolute, baseUrl));
  return new constructor(obj);
};

// Load a list of objects from the ref API
export const getRefs = async (
  links,
  linkKey,
  constructor,
  absolute,
  baseUrl
) => {
  const refs = Object.keys(links)?.filter(l => l.startsWith(linkKey));

  let obj = {};
  for (let i = 0; i < refs.length; i++) {
    obj = {
      ...obj,
      ...(await getRef(
        links,
        `${linkKey}:${i}`,
        constructor,
        absolute,
        baseUrl
      ))
    };
  }

  // The ref API returns a map id => object
  return Object.values(obj);
};
