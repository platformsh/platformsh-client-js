import Ressource from "./Ressource";
import { getConfig } from "../config";

import TeamMember from "./TeamMember";

const paramDefaults = {};
const _url = "/platform/teams";

const creatableField = ["name", "parent", "id"];
const modifiableField = ["name"];

export default class Team extends Ressource {
  constructor(team, url, params, config) {
    super(
      url || `:api_url${_url}`,
      paramDefaults,
      {},
      team,
      creatableField,
      modifiableField,
      config
    );
    this.id = "";
    this.name = "";
    this.parent = ""; // teamId or null
    this.organization = ""; // organizationId
  }

  static get(params = {}, customUrl, config) {
    const { id, ...queryParams } = params;

    return super.get(
      customUrl || `:api_url${_url}/:id`,
      { id },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, customUrl, config) {
    return super.query(
      customUrl || `:api_url${_url}`,
      {},
      super.getConfig(config),
      params
    );
  }

  getMembers() {
    return TeamMember.query({ teamId: this.id }, "", this.getConfig());
  }

  addMember(member) {
    const teamMember = new TeamMember(
      { ...member, teamId: this.id },
      "",
      {},
      this.getConfig()
    );

    return teamMember.save();
  }

  getLink(rel, absolute = true) {
    if (this.hasLink(rel)) {
      return super.getLink(rel, absolute);
    }
    if (rel === "self") {
      const { api_url } = this.getConfig();

      return `${api_url}${_url}/:id`;
    }
  }
}
