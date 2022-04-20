import  { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import CursoredResult from "../CursoredResult";
import OrganizationMember from "../OrganizationMember";
import OrganizationVoucher from "../OrganizationVoucher";
import { autoImplementWithResources } from "../utils";

import { OrganizationType, OrganizationGetParams, OrganizationQueryParams } from "./types";

const paramDefaults = {};
const _url = "/organizations";
const user_url = "/users/:userId/organizations";

const creatableField = ["name", "label", "country"];

const modifiableField = ["name", "label", "country"];

export default class Organization extends autoImplementWithResources()<Omit<OrganizationType, "_links">>() {

  constructor(organization: APIObject, url?: string) {
    const { api_url } = getConfig();

    super(
      url || `${api_url}${_url}/:id`,
      paramDefaults,
      {},
      organization,
      creatableField,
      modifiableField
    );
    this._queryUrl = url || `${api_url}${_url}`;
  }

  static get(params: OrganizationGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Organization>(
      customUrl || `${api_url}${_url}/:id`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: OrganizationQueryParams = {}, customUrl?: string) {
    const { api_url } = getConfig();
    const { userId, ...queryParams } = params;

    let url = `${api_url}${_url}`;
    if (userId) {
      url = `${api_url}${user_url}`;
    }

    return super._query<Organization>(
      customUrl || url,
      { userId },
      paramDefaults,
      queryParams,
      (data) => {
        if(!Array.isArray(data)) {
          return (data as CursoredResult<Organization>)?.items;
        }

        return [];
      });
  }

  getMembers() {
    if(this.id) {
      return OrganizationMember.query({ organizationId: this.id });
    }
  }

  addMember(member: OrganizationMember) {
    const organizationMember = new OrganizationMember({
      organizationId: this.id,
      ...member
    });

    return organizationMember.save();
  }

  getVouchers() {
    if(this.id) {
      return OrganizationVoucher.get({ organizationId: this.id });
    }
  }

  addVoucher(code: string) {
    const { api_url } = getConfig();
    return new OrganizationVoucher({
      organizationId: this.id,
      code
    }, `${api_url}/organizations/${this.id}/vouchers/apply`).save();

  }

  getLink(rel: string, absolute = true) {
    if (this.hasLink(rel)) {
      return super.getLink(rel, absolute);
    }

    return "";
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
