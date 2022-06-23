import PaymentSource from "../PaymentSource";
import { getConfig } from "../../config";
import _urlParser from "../../urlParser";
import request from "../../api";
import { APIObject } from "../Ressource";

import { OrganizationPaymentSourceParams } from "./types";

const url = "/organizations/:organizationId/payment-source";
const paramDefaults = {};

// @ts-ignore
// TODO: solve the getAllowed and intent function inheritance ts error
export default class OrganizationPaymentSource extends PaymentSource {
  constructor(paymentSource: APIObject, customUrl?: string) {
    const { api_url } = getConfig();
    const { organizationId, ...paymentSourceData } = paymentSource;

    super(paymentSourceData, customUrl || `${api_url}${url}`, {
      organizationId
    });
  }

  static get(params: OrganizationPaymentSourceParams, customUrl?: string) {
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
        return new OrganizationPaymentSource(
          this.formatDetails(data.payment_source)
        );
      })
      .catch(err => new OrganizationPaymentSource({}));
  }

  /**
   * Delete the payment source.
   *
   * @return object
   */
  static delete() {
    const { api_url } = getConfig();
    return request(`${api_url}${url}`, "DELETE");
  }

  /**
   * Get allowed payment source.
   * The list of allowed payment sources for the current API consumer.
   *
   * @return object
   */
  static getAllowed(organizationId: string) {
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
  static intent(organizationId: string) {
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
