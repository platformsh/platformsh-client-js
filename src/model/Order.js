import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/orders/:id";
const paramDefaults = {};

export default class Order extends Ressource {
  constructor(account, customUrl, params, config) {
    const { id } = account;

    super(`:api_url${url}`, paramDefaults, { id }, account, [], [], config);
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

  static get(params, customUrl, config) {
    const { id, ...queryParams } = params;

    return super.get(
      customUrl || `:api_url${url}`,
      { id },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, config) {
    return super.query(
      this.getQueryUrl(`:api_url${url}`),
      {},
      super.getConfig(config),
      params,
      data => data.commerce_order
    );
  }
}
