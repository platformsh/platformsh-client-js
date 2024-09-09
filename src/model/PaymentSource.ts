import request from "../api";
import { getConfig } from "../config";
import _urlParser from "../urlParser";

import type { APIObject, ParamsType } from "./Ressource";
import Ressource from "./Ressource";

const url = "/platform/payment_source";
const paramDefaults = {};
const creatableField = ["type", "token", "email", "chargeable"];

export default class PaymentSource extends Ressource {
  id: string;
  type: string;
  type_label: string;
  payment_category: string;
  name: string;
  number: string;
  card?: {
    type: string;
    exp_month: string;
    exp_year: string;
  };

  mandate?: {
    mandate_reference?: string;
    mandate_url?: string;
  };

  chargeable: boolean;

  constructor(
    paymentSource: APIObject,
    customUrl?: string,
    params?: ParamsType
  ) {
    const { api_url } = getConfig();

    super(
      customUrl ?? `${api_url}${url}`,
      paramDefaults,
      params ?? {},
      paymentSource,
      creatableField
    );
    this.id = paymentSource.id;
    this.type = paymentSource.type;
    this.type_label = paymentSource.type_label;
    this.name = paymentSource.name;
    this.number = paymentSource.number;
    this.card = paymentSource.card;
    this.mandate = paymentSource.mandate;
    this.chargeable = paymentSource.chargeable;
    this.payment_category = paymentSource.payment_category;
  }

  static async get(queryParams = {}, customUrl?: string) {
    const { api_url } = getConfig();

    const parsedUrl = _urlParser(
      customUrl ?? `${api_url}${url}`,
      paramDefaults,
      queryParams
    );

    return request(parsedUrl, "GET", queryParams)
      .then(data => {
        if (typeof data === "undefined") return;
        return new PaymentSource(this.formatDetails(data.payment_source));
      })
      .catch(() => new PaymentSource({}));
  }

  static async query(params = {}, customUrl?: string) {
    const { api_url } = getConfig();

    return super._query(
      customUrl ?? `${api_url}${url}`,
      {},
      paramDefaults,
      params
    );
  }

  /**
   * Delete the payment source.
   *
   * @return object
   */
  static async delete(customUrl?: string) {
    const { api_url } = getConfig();
    return request(customUrl ?? `${api_url}${url}`, "DELETE");
  }

  /**
   * Get allowed payment source.
   * The list of allowed payment sources for the current API consumer.
   *
   * @return object
   */
  static async getAllowed(_?: string) {
    const { api_url } = getConfig();
    return request(`${api_url}${url}/allowed`, "GET");
  }

  /**
   * Create a Setup Intent.
   *
   * @return object
   */
  static async intent(_?: string) {
    const { api_url } = getConfig();
    return request(`${api_url}${url}/intent`, "POST");
  }

  /**
   * Format data according to the type of payment source
   *
   * @param paymentSource PaymentSource
   *
   * @return PaymentSource
   */
  static formatDetails(paymentSource: APIObject) {
    switch (paymentSource.type) {
      case "credit-card":
        paymentSource.card = paymentSource.data;
        break;
      default:
        paymentSource.mandate = paymentSource.data;
        break;
    }
    return paymentSource;
  }
}
