import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

import TeamMember from "./TeamMember";

const paramDefaults = {};
const _url = "/platform/teams";

const creatableField = ["name", "parent", "id"];
const modifiableField = ["name"];

export interface TeamGetParams {
  id: string;
  [key: string]: any;
}

export interface TeamQueryParams {
  [key: string]: any;
}

export default class Team extends Ressource {
  id: string;
  name: string;
  parent: string; // teamId or null
  organization: string; // organizationId

  constructor(team: APIObject, url?: string) {
    const { api_url } = getConfig();

    super(
      url || `${api_url}${_url}`,
      paramDefaults,
      {},
      team,
      creatableField,
      modifiableField
    );
    this.id = "";
    this.name = "";
    this.parent = ""; // teamId or null
    this.organization = ""; // organizationId
  }

  static get(params: TeamGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Team>(
      customUrl || `${api_url}${_url}/:id`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: TeamQueryParams, customUrl?: string) {
    const { api_url } = getConfig();

    return super._query<Team>(
      customUrl || `${api_url}${_url}`,
      {},
      paramDefaults,
      params
    );
  }

  getMembers() {
    return TeamMember.query({ teamId: this.id });
  }

  addMember(member: APIObject) {
    const teamMember = new TeamMember({ ...member, teamId: this.id });

    return teamMember.save();
  }

  getLink(rel: string, absolute = true) {
    if (this.hasLink(rel)) {
      return super.getLink(rel, absolute);
    }
    if (rel === "self") {
      const { api_url } = getConfig();

      return `${api_url}${_url}/:id`;
    }

    return "";
  }
}
