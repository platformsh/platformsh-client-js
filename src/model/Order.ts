import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/orders/:id";
const paramDefaults = {};

export interface OrdersGetParams {
  id: string;
  [key: string]: any;
};

export interface CommerceOrderResponse {
  commerce_order: Array<APIObject>
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
  line_items: Array<any>;

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
  }

  static get(params: OrdersGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Order>(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: Record<string, any>) {
    const { api_url } = getConfig();

    return super._query<Order>(
      this.getQueryUrl(`${api_url}${url}`),
      {},
      paramDefaults,
      params,
      (data) => (data as CommerceOrderResponse)?.commerce_order
    );
  }
}
