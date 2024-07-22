import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/organizations/:organizationId/discounts";
const paramDefaults = {};
const creatableField = ["code"];

export type OrganizationDiscountGetParams = {
  [key: string]: any;
  organizationId: string;
};

export type DiscountResponse = {
  discounts: OrganizationDiscount[];
};

export default class OrganizationDiscount extends Ressource {
  items: {
    end_at?: string;
    id: number;
    organization_id: string;
    start_at: string;
    status: string;
    type: string;
    type_label: string;
    commitment?: {
      months?: number;
      amount?: {
        amount: number;
        currency_code: string;
        currency_symbol: string;
        formatted: string;
      };
    };
    config?:
      | {
          commitment_amount: number;
          commitment_months: number;
          discount_amount: number;
          discount_currency: string;
          end_month: number;
          end_year: number;
          start_month: number;
          start_year: number;
        }
      | {
          commitment_amount: number;
          commitment_months: number;
          discount_amount: number;
          discount_currency: string;
          end_month: number;
          end_year: number;
          start_month: number;
          start_year: number;
        }[];
    discount: {
      commitment_period?: {
        amount: number;
        currency_code: string;
        currency_symbol: string;
        formatted: string;
      };

      monthly?: {
        amount: number;
        currency_code: string;
        currency_symbol: string;
        formatted: string;
      };
      total?: {
        amount: number;
        currency_code: string;
        currency_symbol: string;
        formatted: string;
      };
    };
  }[];

  constructor(discount: APIObject, customUrl?: string) {
    const { api_url } = getConfig();

    super(
      customUrl ?? `${api_url}${url}`,
      paramDefaults,
      {},
      discount,
      creatableField
    );
    this.items = [];
  }

  static async get(params: OrganizationDiscountGetParams, customUrl?: string) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<OrganizationDiscount>(
      customUrl ?? `${api_url}${url}`,
      { organizationId },
      {},
      queryParams
    );
  }
}
