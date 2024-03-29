import { getConfig } from "../config";

import type { VoucherResponse } from "./OrganizationVoucher";
import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/v1/vouchers";
const paramDefaults = {};

export type VoucherGetParams = {
  [key: string]: any;
  uuid: string;
};

export type VoucherQueryParams = Record<string, any>;

export default class Voucher extends Ressource {
  currency: string;
  discounted_orders: any[];
  uuid: string;
  vouchers: any[];
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

  static async get(params: VoucherGetParams, customUrl?: string) {
    const { uuid, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Voucher>(
      customUrl ?? `${api_url}${url}`,
      { uuid },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: VoucherQueryParams) {
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
