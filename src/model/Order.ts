import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/v1/orders/:id";
const paramDefaults = {};

export type OrdersGetParams = {
  [key: string]: any;
  id: string;
};

export type CommerceOrderResponse = {
  commerce_order: APIObject[];
};

export default class Order extends Ressource {
  id: string;
  status: string;
  owner: string;
  address: object;
  vat_number: number;
  billing_period_start: string;
  billing_period_end: string;
  total: number;
  components: object;
  currency: string;
  invoice_url: string;
  line_items: any[];
  billing_period_label?: {
    formatted: string;
    month: string;
    next_month: string;
    year: string;
  };

  constructor(account: APIObject) {
    const { id } = account;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, account);
    this.id = "";
    this.status = "";
    this.owner = "";
    this.address = {};
    this.vat_number = 0;
    this.billing_period_start = "";
    this.billing_period_end = "";
    this.total = 0;
    this.components = {};
    this.currency = "";
    this.invoice_url = "";
    this.line_items = [];
    this.billing_period_label = undefined;
  }

  static async get(params: OrdersGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Order>(
      customUrl ?? `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: Record<string, any>) {
    const { api_url } = getConfig();

    return super._query<Order>(
      this.getQueryUrl(`${api_url}${url}`),
      {},
      paramDefaults,
      params,
      data => (data as CommerceOrderResponse)?.commerce_order
    );
  }
}
