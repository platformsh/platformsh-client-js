import { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";

import { VoucherType, OrganizationVoucherGetParams, OrganizationVoucherQueryParams, VoucherResponse } from "./types";

const url = "/organizations/:organizationId/vouchers";
const paramDefaults = {};
const creatableField = ["code"];

export default class OrganizationVoucher extends autoImplementWithResources()<Omit<VoucherType, "_links">>() {
  discounted_orders: Array<any>;
  
  constructor(voucher: APIObject, customUrl?: string) {
    const { api_url } = getConfig();

    super(customUrl || `${api_url}${url}`, paramDefaults, {}, voucher, creatableField);
    this.discounted_orders = voucher.discounted_orders;
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
