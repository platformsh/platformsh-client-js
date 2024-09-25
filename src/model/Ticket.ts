import { authenticatedRequest } from "../api";
import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

const url = "/v1/tickets";
const paramDefaults = {};

export type TicketQueryParams = Record<string, any>;

export type Attachment = {
  filename: string;
  uri: string;
  content_type: string;
};

export type TicketResponse = {
  count: number;
  tickets: Ticket[];
} & APIObject;

export type AttachmentsResponse = {
  attachments: Attachment[];
};

export class Ticket extends Ressource {
  subject: string;
  description: string;
  requester_id: string;
  priority: string;
  affected_url: string;
  subscription_id: string;
  attachment: string;
  attachment_filename: string;
  ticket_id: string;
  environment: string;
  created: string;
  updated: string;
  status: string;
  attachments?: { url: string; filename: string; contentType: string }[];

  constructor(ticket: APIObject) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, ticket, [], []);

    this.subject = ticket.subject;
    this.description = ticket.description;
    this.requester_id = ticket.requester_id;
    this.priority = ticket.priority;
    this.affected_url = ticket.affected_url;
    this.subscription_id = ticket.subscription_id;
    this.attachment = ticket.attachment;
    this.attachment_filename = ticket.attachment_filename;
    this.ticket_id = ticket.ticket_id;
    this.environment = ticket.environment;
    this.created = ticket.created;
    this.updated = ticket.updated;
    this.status = ticket.status;
    this.attachments = ticket.attachments;
  }

  static async getAttachments(ticketId: string) {
    const { api_url } = getConfig();

    return super._get<AttachmentsResponse>(
      `${api_url}/v1/comments/${ticketId}/description`,
      {},
      paramDefaults,
      {}
    );
  }

  static async getAllAttachments(ticketId: string): Promise<Attachment[]> {
    const { api_url } = getConfig();

    return authenticatedRequest(
      `${api_url}/v1/comments/${ticketId}/attachments`,
      "GET"
    );
  }

  static async query(queryParams: TicketQueryParams) {
    const { api_url } = getConfig();

    return super._get<TicketResponse>(
      `${api_url}${url}`,
      {},
      paramDefaults,
      queryParams
    );
  }

  static async open(ticket: APIObject) {
    const { api_url } = getConfig();

    return authenticatedRequest(`${api_url}${url}`, "POST", ticket);
  }

  static async patch(ticketId: string, ticket: APIObject) {
    const { api_url } = getConfig();

    return authenticatedRequest(
      `${api_url}${url}/${ticketId}`,
      "PATCH",
      ticket
    );
  }
}
