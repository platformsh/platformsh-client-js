import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/tickets/priority";
const paramDefaults = {};

export default class TicketPriority extends Ressource {
  constructor(ticketPriority, url, params, config) {
    super(`:api_url${url}`, paramDefaults, {}, ticketPriority, [], [], config);

    this.id = "";
    this.label = "";
    this.short_description = "";
    this.description = "";
  }

  static get(queryParams, config) {
    return super.query(
      `:api_url${url}`,
      {},
      super.getConfig(config),
      queryParams,
      data => data
    );
  }
}
