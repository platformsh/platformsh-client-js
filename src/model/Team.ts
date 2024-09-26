import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";
import { TeamMember } from "./TeamMember";

const paramDefaults = {};
const _url = "/platform/teams";

const creatableField = ["name", "parent", "id"];
const modifiableField = ["name"];

export type TeamGetParams = {
  [key: string]: any;
  id: string;
};

export type TeamQueryParams = Record<string, any>;

export class Team extends Ressource {
  id: string;
  name: string;
  parent: string;
  organization: string;

  constructor(team: APIObject, url?: string) {
    const { api_url } = getConfig();

    super(
      url ?? `${api_url}${_url}`,
      paramDefaults,
      {},
      team,
      creatableField,
      modifiableField
    );
    this.id = team.id;
    this.name = team.name;
    this.parent = team.parent;
    this.organization = team.organization;
  }

  static async get(params: TeamGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Team>(
      customUrl ?? `${api_url}${_url}/:id`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: TeamQueryParams, customUrl?: string) {
    const { api_url } = getConfig();

    return super._query<Team>(
      customUrl ?? `${api_url}${_url}`,
      {},
      paramDefaults,
      params
    );
  }

  async getMembers() {
    return TeamMember.query({ teamId: this.id });
  }

  async addMember(member: APIObject) {
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
