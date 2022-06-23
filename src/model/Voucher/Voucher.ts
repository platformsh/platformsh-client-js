import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { VoucherResponse } from "../OrganizationVoucher";
import { autoImplementWithResources } from "../utils";

import { VoucherGetParams, VoucherQueryParams, VouchersType } from "./types";

const url = "/v1/vouchers";
const paramDefaults = {};

export default class Voucher extends autoImplementWithResources()<VouchersType>() {
  discounted_orders: Array<any>;

  constructor(voucher: APIObject) {
    const { uuid } = voucher;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { uuid }, voucher);
    this.discounted_orders = voucher.discounted_orders;
  }

  static get(params: VoucherGetParams, customUrl?: string) {
    const { uuid, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Voucher>(
      customUrl || `${api_url}${url}`,
      { uuid },
      paramDefaults,
      queryParams
    );
  }

  static query(params: VoucherQueryParams) {
    const { api_url } = getConfig();

    return super._query<Voucher>(
      `${api_url}${url}`,
      {},
      paramDefaults,
      params,
      data => (data as VoucherResponse).vouchers
    );
  }
}
