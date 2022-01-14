import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

const url = "/v1/tickets";
const paramDefaults = {};

export default class Ticket extends Ressource {
  constructor(ticket) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, ticket, [], []);

    this.subject = "";
    this.description = "";
    this.requester_id = "";
    this.priority = "";
    this.affected_url = "";
    this.subscription_id = "";
    this.attachment = "";
    this.attachment_filename = "";
  }

  static getAttachments(ticketId) {
    const { api_url } = getConfig();
    const url = `/v1/comments/${ticketId}/description`;

    return super._get(`${api_url}${url}`, {}, paramDefaults, {});
  }

  static getAllAttachments(ticketId) {
    const { api_url } = getConfig();
    const url = `/v1/comments/${ticketId}/attachments`;

    return request(`${api_url}${url}`, "GET");
  }

  static query(queryParams) {
    const { api_url } = getConfig();

    return super._get(`${api_url}${url}`, {}, paramDefaults, queryParams);
  }

  static open(ticket) {
    const { api_url } = getConfig();

    return request(`${api_url}${url}`, "POST", ticket);
  }

  static patch(ticketId, ticket) {
    const { api_url } = getConfig();

    return request(`${api_url}${url}/${ticketId}`, "PATCH", ticket);
  }
}
