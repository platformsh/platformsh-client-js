import { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import { autoImplementWithResources } from "../utils";

import { OrderType, OrdersGetParams, CommerceOrderResponse } from "./types";

const url = "/v1/orders/:id";
const paramDefaults = {};

export default class Order extends autoImplementWithResources()<OrderType>() {
  line_items: Array<any>;

  constructor(account: APIObject) {
    const { id } = account;
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, { id }, account);
    this.line_items = account.lineItem;
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
