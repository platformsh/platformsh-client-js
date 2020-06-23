/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import PaymentSource from "../src/model/PaymentSource";

describe("PaymentSource", () => {
  const { api_url } = getConfig();

  before(() => {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get PaymentSource", done => {
    fetchMock.mock(`${api_url}/platform/payment_source`, {
      count: 1,
      payment_source: {
        id: "12345",
        source_type: "credit-card",
        name: "Bob",
        number: "XXXX-XXXX-XXXX-4242",
        data: {
          type: "visa",
          exp_month: "4",
          exp_year: "2024"
        }
      }
    });

    PaymentSource.get().then(paymentSource => {
      assert.equal(paymentSource.constructor.name, "PaymentSource");
      assert.equal(paymentSource.id, "12345");
      assert.equal(paymentSource.source_type, "credit-card");
      assert.equal(paymentSource.name, "Bob");
      assert.equal(paymentSource.number, "XXXX-XXXX-XXXX-4242");
      assert.equal(paymentSource.card.type, "visa");
      assert.equal(paymentSource.card.exp_month, "4");
      assert.equal(paymentSource.card.exp_year, "2024");
      done();
    });
  });

  it("Get PaymentSource SEPA", done => {
    fetchMock.mock(`${api_url}/platform/payment_source`, {
      count: 1,
      payment_source: {
        id: "67890",
        source_type: "stripe_sepa_debit",
        name: "Bob",
        number: "DE** **** 3000",
        data: {
          mandate_reference: "84H2QIORBDUQR9BR"
        }
      }
    });

    PaymentSource.get().then(paymentSource => {
      assert.equal(paymentSource.constructor.name, "PaymentSource");
      assert.equal(paymentSource.id, "67890");
      assert.equal(paymentSource.source_type, "stripe_sepa_debit");
      assert.equal(paymentSource.name, "Bob");
      assert.equal(paymentSource.number, "DE** **** 3000");
      assert.equal(paymentSource.mandate.mandate_reference, "84H2QIORBDUQR9BR");
      done();
    });
  });

  it("Get PaymentSource return 404", done => {
    fetchMock.mock(
      `${api_url}/platform/payment_source`,
      {},
      {
        title: "No sources on file.",
        status: 404,
        detail: "Not Found."
      }
    );

    PaymentSource.get().then(paymentSource => {
      assert.equal(paymentSource.id, undefined);
      done();
    });
  });

  it("Get PaymentSource filter by uuid", done => {
    fetchMock.mock(`${api_url}/platform/payment_source?owner=uuid`, {
      count: 1,
      payment_source: {
        id: "12345"
      }
    });

    PaymentSource.get({ owner: "uuid" }).then(paymentSource => {
      assert.equal(paymentSource.constructor.name, "PaymentSource");
      assert.equal(paymentSource.id, "12345");
      done();
    });
  });

  it("Get PaymentSource with empty answer", done => {
    fetchMock.mock(`${api_url}/platform/payment_source`, {
      count: 0,
      payment_source: {}
    });

    PaymentSource.get().then(paymentSource => {
      assert.equal(paymentSource.id, undefined);
      done();
    });
  });

  it("Get PaymentSource allowed", done => {
    fetchMock.mock(`${api_url}/platform/payment_source/allowed`, {
      count: 2,
      payment_sources: [
        { id: "12345", label: "credit-card" },
        { id: "67890", label: "sepa" }
      ]
    });

    PaymentSource.getAllowed().then(data => {
      assert.equal(data.count, 2);
      assert.equal(data.payment_sources[0].id, "12345");
      assert.equal(data.payment_sources[0].label, "credit-card");
      assert.equal(data.payment_sources[1].id, "67890");
      done();
    });
  });

  it("Create payment source", done => {
    const mock = fetchMock.mock(
      `${api_url}/platform/payment_source`,
      {
        id: "12345",
        source_type: "credit-card"
      },
      "POST"
    );

    const ps = new PaymentSource({
      type: "credit-card",
      token: "string",
      email: "email@domain.com"
    });
    ps.save().then(paymentSource => {
      assert.isTrue(mock.called());
      assert.equal(paymentSource.data.id, "12345");
      done();
    });
  });

  it("Delete payment source", done => {
    const mock = fetchMock.mock(
      `${api_url}/platform/payment_source`,
      {},
      {
        method: "DELETE",
        status: 204
      }
    );

    PaymentSource.delete({ uuid: "uuid" }).then(res => {
      assert.isTrue(mock.called());
      done();
    });
  });

  it("Create setup intent", done => {
    const mock = fetchMock.mock(
      `${api_url}/platform/payment_source/intent`,
      {
        client_secret: "qwerty",
        public_key: "azerty"
      },
      "POST"
    );

    PaymentSource.intent().then(data => {
      assert.isTrue(mock.called());
      assert.equal(data.client_secret, "qwerty");
      done();
    });
  });
});
