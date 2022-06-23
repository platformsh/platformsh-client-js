import Ressource, { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import request from "../../api";
import { autoImplementWithResources } from "../utils";

import { TicketQueryParams, Attachment, TicketResponse, TicketType, AttachmentsResponse } from "./types";

const url = "/v1/tickets";
const paramDefaults = {};

export default class Ticket extends autoImplementWithResources()<TicketType>() {
  attachment: string;
  attachment_filename: string;

  constructor(ticket: APIObject) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, ticket, [], []);

    this.attachment = ticket.attachment;
    this.attachment_filename = ticket.attachment_filename;
  }

  static getAttachments(ticketId: string) {
    const { api_url } = getConfig();
    const url = `/v1/comments/${ticketId}/description`;

    return super._get<AttachmentsResponse>(`${api_url}${url}`, {}, paramDefaults, {});
  }

  static getAllAttachments(ticketId: string): Promise<Array<Attachment>> {
    const { api_url } = getConfig();
    const url = `/v1/comments/${ticketId}/attachments`;

    return request(`${api_url}${url}`, "GET");
  }

  static query(queryParams: TicketQueryParams) {
    const { api_url } = getConfig();

    return super._get<TicketResponse>(`${api_url}${url}`, {}, paramDefaults, queryParams);
  }

  static open(ticket: APIObject) {
    const { api_url } = getConfig();

    return request(`${api_url}${url}`, "POST", ticket);
  }

  static patch(ticketId: string, ticket: APIObject) {
    const { api_url } = getConfig();

    return request(`${api_url}${url}/${ticketId}`, "PATCH", ticket);
  }
}
