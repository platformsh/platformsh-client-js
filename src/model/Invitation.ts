import { authenticatedRequest } from "../api";
import { getConfig } from "../config";

import type { ConsoleAccessRole } from "./EnvironmentAccess";
import type { APIObject } from "./Ressource";
import { Ressource } from "./Ressource";

const _queryUrl = "/projects/:projectId/invitations";
const _url = `${_queryUrl}/:id`;

const creatableField = [
  "projectId",
  "environments",
  "permissions",
  "role",
  "email",
  "force"
];

export type InvitationRole = "admin" | "viewer";

export type InvitationEnvironmentType =
  | "production"
  | "development"
  | "staging";

export class Invitation extends Ressource {
  id: string;
  owner: {
    id: string;
    display_name: string;
  };

  projectId: string;
  /** @deprecated This field is deprecated, use permissions instead */
  environments: {
    id?: string;
    type: InvitationEnvironmentType;
    role: ConsoleAccessRole;
    title?: string;
  }[];

  permissions: any[];
  state: string;
  email: string;
  role: InvitationRole;
  force: boolean;
  created_at: string;
  updated_at: string;
  finished_at: string;

  constructor(invitation: APIObject, url?: string) {
    const { projectId, id } = invitation;
    const { api_url } = getConfig();

    super(
      url ?? `${api_url}${_url}`,
      {},
      { projectId, id },
      invitation,
      creatableField,
      []
    );

    this._queryUrl = Ressource.getQueryUrl(this._url);

    this.id = invitation.id;
    this.owner = invitation.owner ?? {};
    this.projectId = invitation.projectId;
    this.environments = invitation.environments ?? []; // This field is deprecated, use permissions instead
    this.permissions = invitation.permissions ?? [];
    this.state = invitation.state;
    this.email = invitation.email;
    this.role = invitation.role;
    this.force = invitation.force;
    this.created_at = invitation.created_at;
    this.updated_at = invitation.updated_at;
    this.finished_at = invitation.finished_at;
  }

  static async get(projectId: string, id: string) {
    const { api_url } = getConfig();

    return super._get<Invitation>(`${api_url}${_url}`, { id, projectId });
  }

  static async query(projectId: string) {
    const { api_url } = getConfig();

    return super._query<Invitation>(
      `${api_url}${_queryUrl}`,
      { projectId },
      {},
      {},
      data => {
        if (Array.isArray(data)) {
          return data.map(d => ({ projectId, ...d }));
        }
        return [];
      }
    );
  }

  async delete() {
    return authenticatedRequest(this._url, "DELETE");
  }
}
