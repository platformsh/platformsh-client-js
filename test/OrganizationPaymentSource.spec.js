/* global beforeEach, afterEach*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import OrganizationPaymentSource from "../src/model/OrganizationPaymentSource";

describe("OrganizationPaymentSource", () => {
  const { api_url } = getConfig();

  beforeEach(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get organization subscription", done => {
    fetchMock.mock(`${api_url}/organizations/aliceOrg/payment-source`, {
      payment_source: {
        data: { exp_month: "1", exp_year: "2024", type: "visa" },
        name: "alice",
        number: "XXXX-XXXX-XXXX-4242",
        type: "credit-card"
      }
    });

    OrganizationPaymentSource.get({ organizationId: "aliceOrg" }).then(
      paymentSource => {
        assert.equal(paymentSource.name, "alice");
        assert.equal(
          paymentSource.constructor.name,
          "OrganizationPaymentSource"
        );
        done();
      }
    );
  });
});
