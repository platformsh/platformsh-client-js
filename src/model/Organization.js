import Ressource from "./Ressource";
import { getConfig } from "../config";

import OrganizationMember from "./OrganizationMember";

const paramDefaults = {};
const _url = "/organizations";

const creatableField = ["name", "label", "owner"];
const modifiableField = ["name", "label"];

export default class Organization extends Ressource {
  constructor(organization, url, params, config) {
    super(
      url || `:api_url${_url}`,
      paramDefaults,
      {},
      organization,
      creatableField,
      modifiableField,
      config
    );
    this.id = "";
    this.name = "";
    this.label = "";
    this.owner = "";
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
    const { api_url } = getConfig();

    return super.query(
      customUrl || `:api_url${_url}`,
      {},
      super.getConfig(),
      params
    );
  }

  getMembers() {
    return OrganizationMember.query(
      { organizationId: this.id },
      "",
      this.getConfig()
    );
  }

  addMember(member) {
    const organizationMember = new OrganizationMember(
      {
        ...member,
        organizationId: this.id
      },
      "",
      {},
      this.getConfig()
    );

    return organizationMember.save();
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
