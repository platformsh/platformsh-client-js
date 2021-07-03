import PaymentSource from "./PaymentSource";
import { getConfig } from "../config";
import Result from "./Result";
import _urlParser from "../urlParser";
import request from "../api";
import Ressource from "./Ressource";

const url = "/organizations/:organizationId/payment-source";
const paramDefaults = {};

export default class OrganizationPaymentSource extends PaymentSource {
  constructor(paymentSource, customUrl) {
    const { api_url } = getConfig();
    const { organizationId, ...paymentSourceData } = paymentSource;

    super(paymentSourceData, customUrl || `${api_url}${url}`, {
      organizationId
    });
  }

  static get(params, customUrl) {
    const { api_url } = getConfig();
    const { organizationId, ...queryParams } = params;

    const parsedUrl = _urlParser(
      customUrl || `${api_url}${url}`,
      { organizationId },
      paramDefaults
    );

    return request(parsedUrl, "GET", queryParams)
      .then(data => {
        if (typeof data === undefined) return {};
        return new this.prototype.constructor(
          this.formatDetails(data.payment_source)
        );
      })
      .catch(err => new this.prototype.constructor());
  }

  /**
   * Delete the payment source.
   *
   * @return object
   */
  static delete(params) {
    const { api_url } = getConfig();
    return request(`${api_url}${url}`, "DELETE", params);
  }

  /**
   * Get allowed payment source.
   * The list of allowed payment sources for the current API consumer.
   *
   * @return object
   */
  static getAllowed(organizationId) {
    const { api_url } = getConfig();
    const parsedUrl = _urlParser(
      `${api_url}${url}`,
      {
        organizationId
      },
      {}
    );
    return request(`${parsedUrl}/allowed`, "GET");
  }

  /**
   * Create a Setup Intent.
   *
   * @return object
   */
  static intent(organizationId) {
    const { api_url } = getConfig();
    const parsedUrl = _urlParser(
      `${api_url}${url}`,
      {
        organizationId
      },
      {}
    );
    return request(`${parsedUrl}/intent`, "POST");
  }
}
