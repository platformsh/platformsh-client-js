import Ressource from "./Ressource";
import { getConfig } from "../config";
import Result from "./Result";
import _urlParser from "../urlParser";
import request from "../api";

const url = "/platform/payment_source";
const paramDefaults = {};
const creatableField = ["type", "token", "email"];

export default class PaymentSource extends Ressource {
  constructor(paymentSource, customUrl, params, config) {
    super(
      `:api_url${url}`,
      paramDefaults,
      {},
      paymentSource,
      creatableField,
      [],
      config
    );
    this.id = "";
    this.type = "";
    this.name = "";
    this.number = "";
    this.card = "";
    this.mandate = "";
  }

  static get(queryParams = {}, customUrl, config) {
    const conf = super.getConfig(config);
    const parsedUrl = _urlParser(
      customUrl || `${conf.api_url}${url}`,
      queryParams
    );

    return request(parsedUrl, "GET", queryParams, conf)
      .then(data => {
        if (typeof data === undefined) return {};
        return new this.prototype.constructor(
          this.formatDetails(data.payment_source)
        );
      })
      .catch(err => new this.prototype.constructor());
  }

  static query(params = {}, customUrl, config) {
    return super.query(
      customUrl || `:api_url${url}`,
      {},
      super.getConfig(config),
      params
    );
  }

  /**
   * Delete the payment source.
   *
   * @return Result
   */
  static delete(params, config) {
    const cnf = super.getConfig(config);
    return request(`${cnf.api_url}${url}`, "DELETE", params, cnf);
  }

  /**
   * Get allowed payment source.
   * The list of allowed payment sources for the current API consumer.
   *
   * @return PaymentSource allowd []
   */
  static getAllowed(config) {
    const cnf = super.getConfig(config);
    return request(`${cnf.api_url}${url}/allowed`, "GET", {}, cnf);
  }

  /**
   * Create a Setup Intent.
   *
   * @return SetupIntent
   */
  static intent(config) {
    const cnf = super.getConfig(config);
    return request(`${cnf.api_url}${url}/intent`, "POST", {}, cnf);
  }

  /**
   * Format data according to the type of payment source
   *
   * @param paymentSource PaymentSource
   *
   * @return PaymentSource
   */
  static formatDetails(paymentSource) {
    switch (paymentSource.type) {
      case "credit-card":
        paymentSource.card = paymentSource.data;
        break;
      case "stripe_sepa_debit":
        paymentSource.mandate = paymentSource.data;
        break;
    }
    return paymentSource;
  }
}
