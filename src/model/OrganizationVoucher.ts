import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const url = "/organizations/:organizationId/vouchers";
const paramDefaults = {};

export interface OrganizationVoucherGetParams {
  organizationId: string;
  [key: string]: any;
};
export interface OrganizationVoucherQueryParams {
  organizationId: string;
  [key: string]: any;
};

export interface VoucherResponse {
  vouchers: Array<OrganizationVoucher>
};

export default class OrganizationVoucher extends Ressource {
  currency: string;
  discounted_orders: Array<any>;
  vouchers: Array<any>;
  vouchers_applied: number;
  vouchers_remaining_balance: number;
  vouchers_total: number;
  
  constructor(voucher: APIObject, customUrl?: string) {
    const { api_url } = getConfig();

    super(customUrl || `${api_url}${url}`, paramDefaults, {}, voucher);
    this.currency = "";
    this.discounted_orders = [];
    this.vouchers = [];
    this.vouchers_applied = 0;
    this.vouchers_remaining_balance = 0;
    this.vouchers_total = 0;
  }

  static get(params: OrganizationVoucherGetParams, customUrl?: string) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<OrganizationVoucher>(
      customUrl || `${api_url}${url}`,
      { organizationId },
      {},
      queryParams
    );
  }

  static query(params: OrganizationVoucherQueryParams) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<OrganizationVoucher>(
      `${api_url}${url}`,
      { organizationId },
      {},
      queryParams,
      data => (data as VoucherResponse).vouchers
    );
  }
}
