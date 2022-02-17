import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";
import { VoucherResponse } from "./OrganizationVoucher";

const url = "/v1/vouchers";
const paramDefaults = {};

export interface VoucherGetParams {
  uuid: string;
  [key: string]: any;
};

export interface VoucherQueryParams {
  [key: string]: any;
};

export default class Voucher extends Ressource {
  currency: string;
  discounted_orders: Array<any>;
  uuid: string;
  vouchers: Array<any>;
  vouchers_applied: number;
  vouchers_remaining_balance: number;
  vouchers_total: number;

  constructor(voucher: APIObject) {
    const { uuid } = voucher;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { uuid }, voucher);
    this.currency = "";
    this.discounted_orders = [];
    this.uuid = "";
    this.vouchers = [];
    this.vouchers_applied = 0;
    this.vouchers_remaining_balance = 0;
    this.vouchers_total = 0;
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
