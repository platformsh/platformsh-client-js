import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";
import CursoredResult from "./CursoredResult";

import OrganizationMember from "./OrganizationMember";
import OrganizationVoucher from "./OrganizationVoucher"; 
import Result from "./Result";
import  request  from "../api"; 

const paramDefaults = {};
const _url = "/organizations";
const user_url = "/users/:userId/organizations";

const creatableField = ["name", "label", "country"];

const modifiableField = ["name", "label", "country"];

type CreateSubscriptionPayloadType={
  projectRegion: string;
  plan?: string;
  projectTitle?: string;
  optionsUrl?: string;
  defaultBranch?: string;
  environments?: number;
  storage?: number
}
export interface OrganizationGetParams {
  id: string;
  [key: string]: any;
};

export interface OrganizationQueryParams {
  userId?: string;
  [key: string]: any;
};

export default class Organization extends Ressource {
  id: string;
  user_id: string;
  name: string;
  label: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  country: string;

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
    return OrganizationMember.query({ organizationId: this.id });
  }

  addMember(member: OrganizationMember) {
    const organizationMember = new OrganizationMember({
      organizationId: this.id,
      ...member
    });

    return organizationMember.save();
  }

  getVouchers() {
    return OrganizationVoucher.get({ organizationId: this.id });
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

   async createSubscription(payload:CreateSubscriptionPayloadType) {
    const organization_id=this.id  
    
    if(organization_id){
    
      const createOrganizationLink=this.getLink('create-subscription')
      const endpoint=`${createOrganizationLink}`
      const data= await request(endpoint,"POST",{...payload, organization_id})
      return new Organization(data, endpoint)
    }
  }
}
