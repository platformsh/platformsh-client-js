import Region from "./Region";
import CursoredResult from "./CursoredResult";
import CursoredRessource from "./CursoredRessource";
import { getConfig } from "../config";

const url = "/organizations/:organizationId/regions/:id";

export default class OrganizationRegion extends Region {
  static query(params) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return CursoredRessource.query(
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
