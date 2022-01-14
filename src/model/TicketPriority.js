import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/tickets/priority";
const paramDefaults = {};

export default class TicketPriority extends Ressource {
  constructor(ticketPriority) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, ticketPriority, [], []);

    this.id = "";
    this.label = "";
    this.short_description = "";
    this.description = "";
  }

  static get(queryParams) {
    const { api_url } = getConfig();

    return super._query(
      `${api_url}${url}`,
      {},
      paramDefaults,
      queryParams,
      data => data
    );
  }
}
