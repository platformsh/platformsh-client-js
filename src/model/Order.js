import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/orders/:id";
const paramDefaults = {};

export default class Order extends Ressource {
  constructor(account) {
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

  static get(params, customUrl) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params) {
    const { api_url } = getConfig();

    return super._query(
      this.getQueryUrl(`${api_url}${url}`),
      {},
      paramDefaults,
      params,
      data => data.commerce_order
    );
  }
}
