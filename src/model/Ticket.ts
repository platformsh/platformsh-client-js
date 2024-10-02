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

export type Priority = "low" | "normal" | "high" | "urgent";

export class Ticket extends Ressource {
  ticket_id: string | number;
  created: string;
  updated: string;
  type: string;
  subject: string;
  description: string;
  priority: Priority;
  followup_tid: null;
  status: string;
  recipient: string;
  requester_id: string;
  submitter_id: string;
  assignee_id: null;
  organization_id: string;
  collaborator_ids: string[];
  has_incidents: boolean;
  due: null;
  tags: string[];
  subscription_id: number;
  ticket_group: null;
  support_plan: string;
  affected_url: string;
  queue: string;
  issue_type: string;
  resolution_time: null;
  response_time: null;
  project_url: string;
  region: string;
  category: string;
  environment: string;
  ticket_sharing_status: string;
  application_ticket_url: string;
  infrastructure_ticket_url: string;
  cloud: string;
  branch: string;
  jira: {
    id: number;
    ticket_id: number;
    issue_id: number;
    issue_key: string;
    created_at: string;
    updated_at: string;
  }[];

  attachment?: string;
  attachment_filename?: string;
  attachments?: { url: string; filename: string; contentType: string }[];

  constructor(ticket: APIObject) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, ticket, [], []);

    this.ticket_id = ticket.ticket_id;
    this.created = ticket.created;
    this.updated = ticket.updated;
    this.type = ticket.type;
    this.subject = ticket.subject;
    this.description = ticket.description;
    this.priority = ticket.priority;
    this.followup_tid = ticket.followup_tid;
    this.status = ticket.status;
    this.recipient = ticket.recipient;
    this.requester_id = ticket.requester_id;
    this.submitter_id = ticket.submitter_id;
    this.assignee_id = ticket.assignee_id;
    this.organization_id = ticket.organization_id;
    this.collaborator_ids = ticket.collaborator_ids;
    this.has_incidents = ticket.has_incidents;
    this.due = ticket.due;
    this.tags = ticket.tags;
    this.subscription_id = ticket.subscription_id;
    this.ticket_group = ticket.ticket_group;
    this.support_plan = ticket.support_plan;
    this.affected_url = ticket.affected_url;
    this.queue = ticket.queue;
    this.issue_type = ticket.issue_type;
    this.resolution_time = ticket.resolution_time;
    this.response_time = ticket.response_time;
    this.project_url = ticket.project_url;
    this.region = ticket.region;
    this.category = ticket.category;
    this.environment = ticket.environment;
    this.ticket_sharing_status = ticket.ticket_sharing_status;
    this.application_ticket_url = ticket.application_ticket_url;
    this.infrastructure_ticket_url = ticket.infrastructure_ticket_url;
    this.cloud = ticket.cloud;
    this.branch = ticket.branch;
    this.jira = ticket.jira;
    this.attachment = ticket.attachment;
    this.attachment_filename = ticket.attachment_filename;
    this.attachments = ticket.attachments;
  }

  static async getAttachments(ticketId: string | number) {
    const { api_url } = getConfig();

    return super._get<AttachmentsResponse>(
      `${api_url}/v1/comments/${ticketId}/description`,
      {},
      paramDefaults,
      {}
    );
  }

  static async getAllAttachments(
    ticketId: string | number
  ): Promise<Attachment[]> {
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

  static async patch(ticketId: string | number, ticket: APIObject) {
    const { api_url } = getConfig();

    return authenticatedRequest(
      `${api_url}${url}/${ticketId}`,
      "PATCH",
      ticket
    );
  }
}
