import Ressource from "./Ressource";
import { getConfig } from "../config";

import TeamMember from "./TeamMember";

const paramDefaults = {};
const _url = "/platform/teams";

const creatableField = ["name", "parent", "id"];
const modifiableField = ["name"];

export default class Team extends Ressource {
  constructor(team, url) {
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

  static get(params = {}, customUrl) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(
      customUrl || `${api_url}${_url}/:id`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params, customUrl) {
    const { api_url } = getConfig();

    return super._query(
      customUrl || `${api_url}${_url}`,
      {},
      paramDefaults,
      params
    );
  }

  getMembers() {
    return TeamMember.query({ teamId: this.id });
  }

  addMember(member) {
    const teamMember = new TeamMember({ ...member, teamId: this.id });

    return teamMember.save();
  }

  getLink(rel, absolute = true) {
    if (this.hasLink(rel)) {
      return super.getLink(rel, absolute);
    }
    if (rel === "self") {
      const { api_url } = getConfig();

      return `${api_url}${_url}/:id`;
    }
  }
}
