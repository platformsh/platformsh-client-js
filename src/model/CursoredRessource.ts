import Ressource, { ParamsType, RessourceChildClass } from "./Ressource";

import _urlParser from "../urlParser";
import request, { RequestOptions } from "../api";
import CursoredResult from "./CursoredResult";

export default abstract class CursoredRessource extends Ressource {
  static async queryCursoredResult<T>(
    _url: string,
    params: ParamsType,
    paramDefaults: ParamsType,
    queryParams: ParamsType,
    ResultConstructor: RessourceChildClass<T>,
    options?: RequestOptions
  ) {
    const parsedUrl = _urlParser(_url, params, paramDefaults);

    const result = await request(parsedUrl, "GET", queryParams, {}, 0, options);

    return new CursoredResult(
      parsedUrl,
      result?.items,
      result?._links,
      ResultConstructor
    );
  }
}
