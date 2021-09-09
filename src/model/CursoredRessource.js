import Ressource from "./Ressource";

import _urlParser from "../urlParser";
import request from "../api";
import CursoredResult from "./CursoredResult";

export default class CursoredRessource extends Ressource {
  static async query(
    _url,
    params,
    paramDefaults,
    queryParams,
    ResultConstructor,
    options
  ) {
    const parsedUrl = _urlParser(_url, params, paramDefaults);

    const result = await request(parsedUrl, "GET", queryParams, {}, 0, options);

    return new CursoredResult(
      parsedUrl,
      result?.items,
      result?._links,
      ResultConstructor || this.prototype.constructor
    );
  }
}
