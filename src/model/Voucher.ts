import { getConfig } from "../config";

import type { VoucherResponse } from "./OrganizationVoucher";
import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

const url = "/v1/vouchers";
const paramDefaults = {};

export type VoucherGetParams = {
  [key: string]: any;
  uuid: string;
};

export type VoucherQueryParams = Record<string, any>;

export class Voucher extends Ressource {
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
    this.currency = voucher.currency;
    this.discounted_orders = voucher.discounted_orders ?? [];
    this.uuid = voucher.uuid;
    this.vouchers = voucher.vouchers ?? [];
    this.vouchers_applied = voucher.vouchers_applied;
    this.vouchers_remaining_balance = voucher.vouchers_remaining_balance;
    this.vouchers_total = voucher.vouchers_total;
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
