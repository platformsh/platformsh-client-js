import request from "../api";
import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";
import Result from "./Result";

const paramDefaults = {};

const modifiableField = ["services", "webapps", "workers"];

export type RoutesStrictTransportSecurity = {
  enabled: boolean | null;
  include_subdomains: boolean | null;
  preload: boolean | null;
};

export type RoutesTls = {
  strict_transport_security: RoutesStrictTransportSecurity;
  min_version: string | null;
  client_authentication: string | null;
  client_certificate_authorities: string[];
};

export type RoutesHttpAccess = {
  is_enabled: boolean;
  addresses: string[];
  basic_auth: Record<string, string>;
};

export type RoutesRedirects = {
  expires: string;
  paths: Record<string, any>;
};

export type RoutesRedirectInfo = {
  primary: boolean;
  id?: string;
  production_url: string;
  attributes: Record<string, any>;
  type: string;
  tls: RoutesTls;
  original_url: string;
  http_access: RoutesHttpAccess;
  restrict_robots: boolean;
  to: string;
  redirects: RoutesRedirects;
  cache?: {
    enabled: boolean;
  };
  ssi?: {
    enabled: boolean;
  };
  upstream?: string;
};

export type DeploymentRoutes = Record<string, RoutesRedirectInfo>;

export type DataRetentionConfig = {
  manual_count: number;
  schedule: {
    interval: string;
    count: number;
  }[];
};

export type DataRetention = {
  production: {
    max_backups: number;
    default_config: DataRetentionConfig;
  };
  development: {
    max_backups: number;
    default_config: DataRetentionConfig;
  };
};

export type ConcurrencyLimits = {
  internal: number;
  integration: number;
  backup: number;
  cron: number;
  default: number;
};

export type DeploymentProjectInfoSettings = {
  additional_hosts: Record<string, any>;
  app_error_page_template?: any;
  application_config_file: string;
  bot_email: string;
  build_resources: {
    cpu: number;
    memory: number;
  };
  centralized_permissions: boolean;
  certificate_renewal_activity: boolean;
  certificate_style: string;
  certifier_url: string;
  chorus: {
    enabled: boolean;
    exposed: boolean;
  };
  concurrency_limits: ConcurrencyLimits;
  cron_maximum_jitter: number;
  cron_minimum_interval: number;
  crons_in_git: boolean;
  custom_error_template?: any;
  data_retention: DataRetention;
  development_application_size: string;
  development_domain_template?: any;
  development_service_size: string;
  enable_admin_agent: boolean;
  enable_cache_grace_period: boolean;
  enable_certificate_provisioning: boolean;
  enable_codesource_integration_push: boolean;
  enable_disk_health_monitoring: boolean;
  enable_incremental_backups: boolean;
  enable_paused_environments: boolean;
  enable_routes_tracing: boolean;
  enable_state_api_deployments: boolean;
  enable_unified_configuration: boolean;
  enable_zero_downtime_deployments: boolean;
  enforce_mfa: boolean;
  environment_name_strategy: string;
  flexible_build_cache: boolean;
  glue_server_max_request_size: number;
  has_sleepy_crons: boolean;
  image_deployment_validation: boolean;
  initialize: Record<string, any>;
  max_allowed_redirects_paths: number;
  max_allowed_routes: number;
  outbound_restrictions_default_policy: string;
  persistent_endpoints_ssh: boolean;
  persistent_endpoints_ssl_certificates: boolean;
  product_code: string;
  product_name: string;
  project_config_dir: string;
  router_gen2: boolean;
  self_upgrade: boolean;
  sizing_api_enabled: boolean;
  strict_configuration: boolean;
  support_generic_images: boolean;
  systemd: boolean;
  temporary_disk_size?: number;
  ui_uri_template: string;
  use_drupal_defaults: boolean;
  use_legacy_subdomains: boolean;
  variables_prefix: string;
};

export type DeploymentProjectInfo = {
  title: string;
  name: string;
  namespace: string;
  organization: string;
  capabilities: any;
  settings: DeploymentProjectInfoSettings;
};

export type DeploymentEnvironmentInfo = {
  name: string;
  status: string;
  is_main: boolean;
  is_production: boolean;
  reference: string;
  machine_name: string;
  environment_type: string;
  links: Record<string, { href: string }>;
};

export type ServiceResource = {
  base_memory?: number;
  memory_ratio?: number;
  profile_size: string | null;
  minimum?: {
    cpu?: number;
    memory?: number;
    disk?: number | null;
    profile_size?: string;
  };
  default?: {
    cpu?: number;
    memory?: number;
    disk?: number | null;
    profile_size?: string;
  };
};

export type ServiceAccess = {
  [x in string]: string;
};

export type ServiceLocations = Record<
  string,
  {
    root?: string;
    expires: string;
    passthru: boolean;
    scripts: boolean;
    allow: boolean;
    headers: Record<string, string>;
    rules: Record<string, any>;
  }
>;

export type ServiceCommands = Record<string, string>;

export type ServiceUpstream = {
  socket_family: string;
  protocol?: string;
};

export type ServiceWeb = {
  locations: ServiceLocations;
  commands: ServiceCommands;
  upstream: ServiceUpstream;
  move_to_root: boolean;
};

export type ServiceHooks = { [x in string]: string };

export type ServiceEndpoints = Record<
  string,
  {
    scheme: string;
    port: number;
  }
>;

export type DeploymentService = {
  resources: ServiceResource;
  size?: string;
  disk?: number;
  access: ServiceAccess;
  relationships: Record<string, any>;
  additional_hosts: Record<string, any>;
  mounts: Record<string, any>;
  timezone?: string;
  variables: Record<string, any>;
  firewall?: any;
  container_profile?: string;
  operations: Record<string, any>;
  name: string;
  type: string;
  preflight: {
    enabled: boolean;
    ignored_rules: any[];
  };
  tree_id: string;
  slug_id: string;
  app_dir: string;
  endpoints: ServiceEndpoints;
  runtime: Record<string, any>;
  web: ServiceWeb;
  hooks: ServiceHooks;
  crons: Record<string, any>;
  instance_count?: number;
};

export type DeploymentGetParams = {
  [key: string]: any;
  projectId: string;
  environmentId: string;
};

export type DeploymentUpdateParams = {
  services?: any;
  webapps?: any;
  workers?: any;
};

export type RunRuntimeOpParams = {
  projectId: string;
  deploymentId: string;
  environmentId: string;
  service: string;
  operation: string;
};

export type DeploymentServices = Record<string, DeploymentService>;

export default class Deployment extends Ressource {
  id: string;
  webapps: DeploymentServices;
  services: DeploymentServices;
  workers: DeploymentServices;
  routes: DeploymentRoutes;
  project_info: DeploymentProjectInfo;
  environment_info: DeploymentEnvironmentInfo;
  fingerprint: string;
  container_profiles: Record<
    string,
    Record<
      string,
      {
        cpu: number;
        memory: number;
      }
    >
  >;

  variables: {
    name: string;
    value: string;
    is_sensitive: boolean;
  }[];

  constructor(deployment: APIObject, url: string) {
    super(url, paramDefaults, {}, deployment, [], modifiableField);
    this.webapps = {} as Record<string, DeploymentService>;
    this.services = {} as Record<string, DeploymentService>;
    this.workers = {} as Record<string, DeploymentService>;
    this.routes = {};
    this.container_profiles = {};
    this.variables = [];
    this.project_info = {} as DeploymentProjectInfo;
    this.environment_info = {} as DeploymentEnvironmentInfo;
    this.fingerprint = "";
    this.id = "";
  }

  static async get(params: DeploymentGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Deployment>(
      customUrl ??
        `${api_url}/projects/:projectId/environments/:environmentId/deployments/current`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static async getNext(params: DeploymentGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Deployment>(
      customUrl ??
        `${api_url}/projects/:projectId/environments/:environmentId/deployments/next`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static async getDeployments(params: DeploymentGetParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Deployment[]>(
      customUrl ??
        `${api_url}/projects/:projectId/environments/:environmentId/deployments`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  static async run(params: RunRuntimeOpParams) {
    const { api_url } = getConfig();
    const { projectId, deploymentId, environmentId, service, operation } =
      params;
    const body: Record<string, any> = {
      operation,
      service
    };
    const url = `${api_url}/projects/${projectId}/environments/${environmentId}/deployments/${deploymentId}/operations`;

    return request(url, "POST", body).then(async data => {
      const result = new Result(data, url);
      const activities = await result.getActivities();

      if (activities.length !== 1) {
        throw new Error(`Expected one activity, found ${activities.length}`);
      }

      return activities[0];
    });
  }
}
