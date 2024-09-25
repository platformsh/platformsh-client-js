import { authenticatedRequest } from "../api";
import { getConfig } from "../config";
import { urlParser } from "../urlParser";

import { PaymentSource } from "./PaymentSource";
import type { APIObject } from "./Ressource";

const url = "/organizations/:organizationId/payment-source";
const paramDefaults = {};

export type OrganizationPaymentSourceParams = {
  [key: string]: any;
  organizationId: string;
};

export class OrganizationPaymentSource extends PaymentSource {
  constructor(paymentSource: APIObject, customUrl?: string) {
    const { api_url } = getConfig();
    const { organizationId, ...paymentSourceData } = paymentSource;

    super(paymentSourceData, customUrl ?? `${api_url}${url}`, {
      organizationId
    });
  }

  static async get(
    params: OrganizationPaymentSourceParams,
    customUrl?: string
  ) {
    const { api_url } = getConfig();
    const { organizationId, ...queryParams } = params;

    const parsedUrl = urlParser(
      customUrl ?? `${api_url}${url}`,
      { organizationId },
      paramDefaults
    );

    return authenticatedRequest(parsedUrl, "GET", queryParams)
      .then(data => {
        if (typeof data === "undefined") return;
        return new OrganizationPaymentSource(
          this.formatDetails(data.payment_source)
        );
      })
      .catch(() => new OrganizationPaymentSource({}));
  }

  /**
   * Delete the payment source.
   *
   * @return object
   */
  static async delete() {
    const { api_url } = getConfig();
    return authenticatedRequest(`${api_url}${url}`, "DELETE");
  }

  /**
   * Get allowed payment source.
   * The list of allowed payment sources for the current API consumer.
   *
   * @return object
   */
  static async getAllowed(organizationId: string) {
    const { api_url } = getConfig();
    const parsedUrl = urlParser(
      `${api_url}${url}`,
      {
        organizationId
      },
      {}
    );
    return authenticatedRequest(`${parsedUrl}/allowed`, "GET");
  }

  /**
   * Create a Setup Intent.
   *
   * @return object
   */
  static async intent(organizationId: string) {
    const { api_url } = getConfig();
    const parsedUrl = urlParser(
      `${api_url}${url}`,
      {
        organizationId
      },
      {}
    );
    return authenticatedRequest(`${parsedUrl}/intent`, "POST");
  }

  static async setVerificationMethodAsPaymentMethod(organizationId: string) {
    const { api_url } = getConfig();
    const parsedUrl = urlParser(
      `${api_url}${url}`,
      {
        organizationId
      },
      {}
    );
    return authenticatedRequest(`${parsedUrl}`, "PATCH", { chargeable: true });
  }
}
