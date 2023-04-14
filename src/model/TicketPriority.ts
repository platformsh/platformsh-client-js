import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/v1/tickets/priority";
const paramDefaults = {};

export type TicketPriorityGetParams = Record<string, any>;

export default class TicketPriority extends Ressource {
  id: string;
  label: string;
  short_description: string;
  description: string;

  constructor(ticketPriority: APIObject) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, ticketPriority, [], []);

    this.id = "";
    this.label = "";
    this.short_description = "";
    this.description = "";
  }

  static async get(queryParams: TicketPriorityGetParams) {
    const { api_url } = getConfig();

    return super._query<TicketPriority>(
      `${api_url}${url}`,
      {},
      paramDefaults,
      queryParams
    );
  }
}
