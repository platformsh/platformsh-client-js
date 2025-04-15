import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

const url = "/orders/:id";
const paramDefaults = {};

export type OrdersGetParams = {
  [key: string]: any;
  id: string;
};

export type CommerceOrderResponse = {
  commerce_order: APIObject[];
};

export type LineItemComponent = {
  amount: number;
  amount_formatted?: string;
  currency?: string;
  display_title: string;
  formatted?: string;
  weight?: number;
};

export type OrderLineItem = {
  project: string | null;
  product: string;
  subscription_id: string;
  type: string;
  components: Record<string, LineItemComponent>;
  start: string;
  end: string;
  unit_price: number;
  quantity: string | number;
  quantity_formatted?: string;
  consumption: string | number;
  custom_description?: string;
  duration: number;
  exclude_from_invoice?: boolean;
  id: string;
  organization: string | null;
  plan_record_id: string | null;
  proration: string | number;
  records?: {
    duration: number;
    end: string;
    quantity: string;
    series: string;
    start: string;
  }[];
  total_price: number;
  total_price_formatted: string;
  unit_price_formatted?: string;
};

export class Order extends Ressource {
  id: string;
  status: string;
  owner: string;
  address: object;
  vat_number: number;
  billing_period_start: string;
  billing_period_end: string;
  last_refreshed: string;
  total: number;
  total_formatted: string;
  components: Record<string, LineItemComponent>;
  currency: string;
  invoice_url: string;
  line_items: OrderLineItem[];
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

    this.id = id;
    this.status = account.status;
    this.owner = account.owner;
    this.address = account.address ?? {};
    this.vat_number = account.vat_number;
    this.billing_period_start = account.billing_period_start;
    this.billing_period_end = account.billing_period_end;
    this.last_refreshed = account.last_refreshed;
    this.total = account.total;
    this.total_formatted = account.total_formatted;
    this.components = account.components ?? {};
    this.currency = account.currency;
    this.invoice_url = account.invoice_url;
    this.line_items = account.line_items ?? [];
    this.billing_period_label = account.billing_period_label;
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
