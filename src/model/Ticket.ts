import request from "../api";
import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/v1/tickets";
const paramDefaults = {};

export type TicketQueryParams = Record<string, any>;

export type Attachment = {
  filename: string;
  uri: string;
  content_type: string;
};

export type TicketResponse = {
  data: {
    count: number;
    tickets: Ticket[];
  };
} & APIObject;

export type AttachmentsResponse = {
  attachments: Attachment[];
};

export default class Ticket extends Ressource {
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

    this.subject = "";
    this.description = "";
    this.requester_id = "";
    this.priority = "";
    this.affected_url = "";
    this.subscription_id = "";
    this.attachment = "";
    this.attachment_filename = "";
    this.ticket_id = "";
    this.environment = "";
    this.created = "";
    this.updated = "";
    this.status = "";
    this.attachments = undefined;
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

    return request(`${api_url}/v1/comments/${ticketId}/attachments`, "GET");
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

    return request(`${api_url}${url}`, "POST", ticket);
  }

  static async patch(ticketId: string, ticket: APIObject) {
    const { api_url } = getConfig();

    return request(`${api_url}${url}/${ticketId}`, "PATCH", ticket);
  }
}
