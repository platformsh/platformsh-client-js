import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { PaymentSource } from "../src/model/PaymentSource";

describe("PaymentSource", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get PaymentSource", async () => {
    fetchMock.mock(`${api_url}/platform/payment_source`, {
      count: 1,
      payment_source: {
        id: "12345",
        type: "credit-card",
        name: "Bob",
        number: "XXXX-XXXX-XXXX-4242",
        data: {
          type: "visa",
          exp_month: "4",
          exp_year: "2024"
        }
      }
    });

    await PaymentSource.get().then(paymentSource => {
      assert.equal(paymentSource?.constructor.name, "PaymentSource");
      assert.equal(paymentSource?.id, "12345");
      assert.equal(paymentSource?.type, "credit-card");
      assert.equal(paymentSource?.name, "Bob");
      assert.equal(paymentSource?.number, "XXXX-XXXX-XXXX-4242");
      assert.equal(paymentSource?.card?.type, "visa");
      assert.equal(paymentSource?.card?.exp_month, "4");
      assert.equal(paymentSource?.card?.exp_year, "2024");
    });
  });

  it("Get PaymentSource SEPA", async () => {
    fetchMock.mock(`${api_url}/platform/payment_source`, {
      count: 1,
      payment_source: {
        id: "67890",
        type: "stripe_sepa_debit",
        name: "Bob",
        number: "DE** **** 3000",
        data: {
          mandate_reference: "84H2QIORBDUQR9BR"
        }
      }
    });

    await PaymentSource.get().then(paymentSource => {
      assert.equal(paymentSource?.constructor.name, "PaymentSource");
      assert.equal(paymentSource?.id, "67890");
      assert.equal(paymentSource?.type, "stripe_sepa_debit");
      assert.equal(paymentSource?.name, "Bob");
      assert.equal(paymentSource?.number, "DE** **** 3000");
      assert.equal(
        paymentSource?.mandate?.mandate_reference,
        "84H2QIORBDUQR9BR"
      );
    });
  });

  it("Get PaymentSource return 404", async () => {
    fetchMock.mock(`${api_url}/platform/payment_source`, {});

    await PaymentSource.get().then(paymentSource => {
      assert.equal(paymentSource?.id, undefined);
    });
  });

  it("Get PaymentSource filter by uuid", async () => {
    fetchMock.mock(`${api_url}/platform/payment_source?owner=uuid`, {
      count: 1,
      payment_source: {
        id: "12345"
      }
    });

    await PaymentSource.get({ owner: "uuid" }).then(paymentSource => {
      assert.equal(paymentSource?.constructor.name, "PaymentSource");
      assert.equal(paymentSource?.id, "12345");
    });
  });

  it("Get PaymentSource with empty answer", async () => {
    fetchMock.mock(`${api_url}/platform/payment_source`, {
      count: 0,
      payment_source: {}
    });

    await PaymentSource.get().then(paymentSource => {
      assert.equal(paymentSource?.id, undefined);
    });
  });

  it("Get PaymentSource allowed", async () => {
    fetchMock.mock(`${api_url}/platform/payment_source/allowed`, {
      count: 2,
      payment_sources: [
        { id: "12345", label: "credit-card" },
        { id: "67890", label: "sepa" }
      ]
    });

    await PaymentSource.getAllowed().then(data => {
      assert.equal(data.count, 2);
      assert.equal(data.payment_sources[0].id, "12345");
      assert.equal(data.payment_sources[0].label, "credit-card");
      assert.equal(data.payment_sources[1].id, "67890");
    });
  });

  it("Create payment source", async () => {
    const mock = fetchMock.mock(
      `${api_url}/platform/payment_source`,
      {
        id: "12345",
        type: "credit-card"
      },
      { method: "POST" }
    );

    const ps = new PaymentSource({
      type: "credit-card",
      token: "string",
      email: "email@domain.com"
    });
    await ps.save().then(paymentSource => {
      assert.isTrue(mock.called());
      assert.equal(paymentSource.data.id, "12345");
    });
  });

  it("Delete payment source", async () => {
    const mock = fetchMock.mock(
      `${api_url}/platform/payment_source`,
      {},
      {
        method: "DELETE"
      }
    );

    await PaymentSource.delete().then(() => {
      assert.isTrue(mock.called());
    });
  });

  it("Create setup intent", async () => {
    const mock = fetchMock.mock(
      `${api_url}/platform/payment_source/intent`,
      {
        client_secret: "qwerty",
        public_key: "azerty"
      },
      { method: "POST" }
    );

    await PaymentSource.intent().then(data => {
      assert.isTrue(mock.called());
      assert.equal(data.client_secret, "qwerty");
    });
  });
});
