import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/vouchers";
const paramDefaults = {};

export default class Voucher extends Ressource {
  constructor(account, url, params, config) {
    const { uuid } = account;

    super(`:api_url${url}`, paramDefaults, { uuid }, account, [], [], config);
    this.currency = "";
    this.discounted_orders = [];
    this.uuid = "";
    this.vouchers = [];
    this.vouchers_applied = 0;
    this.vouchers_remaining_balance = 0;
    this.vouchers_total = 0;
  }

  static get(params, customUrl, config) {
    const { uuid, ...queryParams } = params;

    return super.get(
      customUrl || `:api_url${url}`,
      { uuid },
      super.getConfig(config),
      queryParams
    );
  }

  static query(params, config) {
    return super.query(
      `:api_url${url}`,
      {},
      super.getConfig(config),
      params,
      data => data.vouchers
    );
  }
}
