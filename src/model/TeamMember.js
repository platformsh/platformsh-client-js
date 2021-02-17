import Ressource from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/platform/teams/:teamId/members";

const creatableField = ["role"];

export default class TeamMember extends Ressource {
  constructor(teamMember, url, params, config) {
    const { teamId } = teamMember;

    super(
      url || `:api_url${_url}`,
      paramDefaults,
      { teamId },
      teamMember,
      creatableField,
      creatableField,
      config
    );
    this.user = ""; // userId
  }

  static get(params = {}, customUrl, config) {
    const { teamId, id, ...queryParams } = params;

    return super.get(
      customUrl || `:api_url}${_url}/:id`,
      { teamId, id },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, customUrl, config) {
    const { teamId, ...queryParams } = params;

    return super.query(
      customUrl || `:api_url${_url}`,
      { teamId },
      super.getConfig(config),
      queryParams
    );
  }
}
