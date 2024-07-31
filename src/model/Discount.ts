import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/v1/discounts";
const paramDefaults = {};

export type DiscountGetParams = {
  [key: string]: any;
  uuid: string;
};

export type DiscountQueryParams = Record<string, any>;

export default class Discount extends Ressource {
  // currency: string;
  // discounted_orders: any[];
  // uuid: string;
  // vouchers: any[];
  // vouchers_applied: number;
  // vouchers_remaining_balance: number;
  // vouchers_total: number;

  constructor(discount: APIObject) {
    const { uuid } = discount;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { uuid }, discount);
  }

  static async get(params: DiscountGetParams, customUrl?: string) {
    const { uuid, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<any>(
      customUrl ?? `${api_url}${url}/type/allowance`,
      { uuid },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: DiscountQueryParams) {
    const { api_url } = getConfig();

    return super._query<Discount>(
      `${api_url}${url}`,
      {},
      paramDefaults,
      params,
      data => data as any
    );
  }
}
