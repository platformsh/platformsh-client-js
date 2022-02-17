import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const paramDefaults = {};
const _url = "/platform/teams/:teamId/members";

const creatableField = ["role"];

export interface TeamMemberGetParams {
  id: string;
  teamId: string,
  [key: string]: any;
};

export interface TeamMemberQueryParams {
  teamId: string,
  [key: string]: any;
};

export default class TeamMember extends Ressource {
  user: string;

  constructor(teamMember: APIObject, url?: string) {
    const { teamId } = teamMember;
    const { api_url } = getConfig();

    super(
      url || `${api_url}${_url}`,
      paramDefaults,
      { teamId },
      teamMember,
      creatableField,
      creatableField
    );
    this.user = ""; // userId
  }

  static get(params: TeamMemberGetParams, customUrl?: string) {
    const { teamId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<TeamMember>(
      customUrl || `${api_url}${_url}/:id`,
      { teamId, id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: TeamMemberQueryParams, customUrl?: string) {
    const { teamId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<TeamMember>(
      customUrl || `${api_url}${_url}`,
      { teamId },
      paramDefaults,
      queryParams
    );
  }
}
