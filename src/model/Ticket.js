import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

const url = "/v1/tickets";
const paramDefaults = {};

export default class Ticket extends Ressource {
  constructor(ticket, url, params, config) {
    const { api_url } = getConfig();

    super(`:api_url${url}`, paramDefaults, {}, ticket, [], [], config);

    this.subject = "";
    this.description = "";
    this.requester_id = "";
    this.priority = "";
    this.affected_url = "";
    this.subscription_id = "";
    this.attachment = "";
    this.attachment_filename = "";
  }

  static getAttachments(ticketId, config) {
    const url = `/v1/comments/${ticketId}/description`;

    return super.get(`:api_url${url}`, {}, super.getConfig(config), {});
  }

  static getAllAttachments(ticketId, config) {
    const cnf = super.getConfig(config);
    const url = `/v1/comments/${ticketId}/attachments`;

    return request(`${cnf.api_url}${url}`, "GET", {}, cnf);
  }

  static query(queryParams, config) {
    return super.get(
      `:api_url${url}`,
      {},
      super.getConfig(config),
      queryParams
    );
  }

  static open(ticket, config) {
    const cnf = super.getConfig(config);

    return request(`${cnf.api_url}${url}`, "POST", ticket, cnf);
  }

  static patch(ticketId, ticket, config) {
    const cnf = super.getConfig(config);

    return request(`${cnf.api_url}${url}/${ticketId}`, "PATCH", ticket, cnf);
  }
}
