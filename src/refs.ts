import request from "./api";
import type { APIObject, RessourceChildClass } from "./model/Ressource";

export type Link = {
  [key: string]: unknown;
  href: string;
};

export type Links = Record<string, Link | Link[]>;

type GetLinkOptions = {
  absolute?: boolean;
  baseUrl?: string;
  hrefOnly?: boolean;
};

export const makeAbsoluteUrl = (relativeUrl: string, _baseUrl = "") =>
  `${_baseUrl}${relativeUrl}`;

export const hasLink = (links: Links | undefined, rel: string): boolean =>
  !!links?.[rel];

export const getLink = (
  links: Links | undefined,
  rel: string,
  { absolute = true, baseUrl = "", hrefOnly = false }: GetLinkOptions
) => {
  if (!links) {
    return;
  }

  if (!hasLink(links, rel)) {
    throw new Error(`Link not found: ${rel}`);
  }

  const link = links[rel];

  if (!Array.isArray(link) && (Object.keys(link).length === 1 || hrefOnly)) {
    let _url = (links[rel] as Link).href;

    if (absolute && !_url.includes("//")) {
      _url = makeAbsoluteUrl(_url, baseUrl);
    }

    return _url;
  }

  return link;
};

export const getLinkHref = (
  links: Links | undefined,
  rel: string,
  absolute = true,
  baseUrl = ""
): string =>
  getLink(links, rel, {
    absolute,
    baseUrl,
    hrefOnly: true
  }) as string;

// Load a single object from the ref API
export const getRef = async <T>(
  links: Links | undefined,
  linkKey: string,
  constructor: RessourceChildClass<T>,
  absolute = true,
  baseUrl = ""
) => {
  const obj = await request(getLinkHref(links, linkKey, absolute, baseUrl));
  return new constructor(obj);
};

// Load a list of objects from the ref API
export const getRefs = async <T>(
  links: Links | undefined,
  linkKey: string,
  constructor: RessourceChildClass<T>,
  absolute: boolean,
  baseUrl = ""
): Promise<T[]> => {
  if (!links) {
    return Promise.resolve([]);
  }
  const refs = Object.keys(links)?.filter(l => l.startsWith(linkKey));

  let obj: Record<string, APIObject> = {};
  for (let i = 0; i < refs.length; i++) {
    obj = {
      ...obj,
      // eslint-disable-next-line no-await-in-loop
      ...(await request(
        getLinkHref(links, `${linkKey}:${i}`, absolute, baseUrl)
      ))
    };
  }

  // The ref API returns a map id => object
  return Object.values(obj).map((o: APIObject) => o && new constructor(o));
};
