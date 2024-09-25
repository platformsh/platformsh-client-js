import type { RequestOptions } from "../api";
import { authenticatedRequest } from "../api";
import { urlParser } from "../urlParser";

import { CursoredResult } from "./CursoredResult";
import { Ressource } from "./Ressource";
import type { ParamsType, RessourceChildClass } from "./Ressource";

export abstract class CursoredRessource extends Ressource {
  static async queryCursoredResult<T>(
    _url: string,
    params: ParamsType,
    paramDefaults: ParamsType,
    queryParams: ParamsType,
    ResultConstructor: RessourceChildClass<T>,
    options?: RequestOptions
  ) {
    const parsedUrl = urlParser(_url, params, paramDefaults);

    const result = await authenticatedRequest(
      parsedUrl,
      "GET",
      queryParams,
      {},
      0,
      options
    );

    return new CursoredResult(
      parsedUrl,
      result?.items,
      result?._links,
      ResultConstructor
    );
  }
}
