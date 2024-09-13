import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const _url = "/platform/teams/:teamId/members";

const creatableField = ["role"];

export type TeamMemberGetParams = {
  [key: string]: any;
  id: string;
  teamId: string;
};

export type TeamMemberQueryParams = {
  [key: string]: any;
  teamId: string;
};

export default class TeamMember extends Ressource {
  user: string;
  role?: unknown;

  constructor(teamMember: APIObject, url?: string) {
    const { teamId } = teamMember;
    const { api_url } = getConfig();

    super(
      url ?? `${api_url}${_url}`,
      paramDefaults,
      { teamId },
      teamMember,
      creatableField,
      creatableField
    );
    this.user = teamMember.user;
    this.role = teamMember.role;
  }

  static async get(params: TeamMemberGetParams, customUrl?: string) {
    const { teamId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<TeamMember>(
      customUrl ?? `${api_url}${_url}/:id`,
      { teamId, id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: TeamMemberQueryParams, customUrl?: string) {
    const { teamId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<TeamMember>(
      customUrl ?? `${api_url}${_url}`,
      { teamId },
      paramDefaults,
      queryParams
    );
  }
}
