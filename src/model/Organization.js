import Ressource from "./Ressource";
import { getConfig } from "../config";

import OrganizationMember from "./OrganizationMember";

const paramDefaults = {};
const _url = "/organizations";
const user_url = "/users/:userId/organizations";

const creatableField = ["name", "label", "country"];

const modifiableField = ["name", "label", "country"];

export default class Organization extends Ressource {
  constructor(organization, url) {
    const { api_url } = getConfig();

    super(
      url || `${api_url}${_url}/:id`,
      paramDefaults,
      {},
      organization,
      creatableField,
      modifiableField
    );
    this.id = "";
    this.user_id = "";
    this.name = "";
    this.label = "";
    this.country = "";
    this.owner_id = "";
    this.created_at = "";
    this.updated_at = "";
    this._queryUrl = url || `${api_url}${_url}`;
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

  static query(params = {}, customUrl) {
    const { api_url } = getConfig();
    const { userId, ...queryParams } = params;

    let url = `${api_url}${_url}`;
    if (userId) {
      url = `${api_url}${user_url}`;
    }

    return super._query(
      customUrl || url,
      { userId },
      paramDefaults,
      queryParams,
      data => data.items
    );
  }

  getMembers() {
    return OrganizationMember.query({ organizationId: this.id });
  }

  addMember(member) {
    const organizationMember = new OrganizationMember({
      organizationId: this.id,
      ...member
    });

    return organizationMember.save();
  }

  getLink(rel, absolute = true) {
    if (this.hasLink(rel)) {
      return super.getLink(rel, absolute);
    }
  }

  /**
   * Delete an organization,
   * we have to override super.delete()
   * since organization links are not prefixed with # as implemented in Resouce
   */
  delete() {
    return super.delete(this.getLink("delete"));
  }
}
