import request from "./api";
import { APIObject, RessourceChildClass } from "./model/Ressource";

export interface Link {
  href: string
}

type Links = Record<string, Link>;

export const makeAbsoluteUrl = (relativeUrl: string, _baseUrl: string = "") => {
  return `${_baseUrl}${relativeUrl}`;
};

export const hasLink = (links: Record<string, Link> | undefined, rel: string): boolean => {
  if(!links || !links[rel]) {
    return false;
  }
  
  return !!links[rel].href;
};

export const getLink = (links: Links | undefined, rel: string, absolute: boolean = true, baseUrl: string = "") => {
  if (!hasLink(links, rel)) {
    throw new Error(`Link not found: ${rel}`);
  }

  if(!links) {
    return "";
  }

  let _url = links[rel].href;

  if (absolute && _url.indexOf("//") === -1) {
    _url = makeAbsoluteUrl(_url, baseUrl);
  }

  return _url;
};

// Load a single object from the ref API
export const getRef = async (
  links: Links | undefined,
  linkKey: string,
  constructor: RessourceChildClass,
  absolute: boolean = true,
  baseUrl: string = ""
) => {
  const obj = await request(getLink(links, linkKey, absolute, baseUrl));
  return new constructor(obj);
};

// Load a list of objects from the ref API
export const getRefs = async (
  links: Links | undefined,
  linkKey: string,
  constructor: RessourceChildClass,
  absolute: boolean,
  baseUrl: string = ""
) => {
  if (!links) {
    return [];
  }
  const refs = Object.keys(links)?.filter(l => l.startsWith(linkKey));

  let obj: Record<string, APIObject> = {};
  for (let i = 0; i < refs.length; i++) {
    obj = {
      ...obj,
      ...(await request(getLink(links, `${linkKey}:${i}`, absolute, baseUrl)))
    };
  }

  // The ref API returns a map id => object
  return Object.values(obj).map((o: APIObject) => o && new constructor(o));
};
