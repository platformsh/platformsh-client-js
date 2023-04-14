import { getConfig } from "../config";

import CursoredRessource from "./CursoredRessource";
import Region from "./Region";

const url = "/organizations/:organizationId/regions/:id";

export type OrganizationRegionQueryParams = {
  [key: string]: any;
  organizationId: string;
};

// @ts-expect-error solve the query function inheritance ts error
export default class OrganizationRegion extends Region {
  static async query(params: OrganizationRegionQueryParams) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return CursoredRessource.queryCursoredResult(
      this.getQueryUrl(`${api_url}${url}`),
      { organizationId },
      {},
      queryParams,
      OrganizationRegion,
      {
        queryStringArrayPrefix: "[]"
      }
    );
  }
}
