import request from "../api";
import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const paramDefaults = {};
const _url = "/projects/:projectId/environments/:environmentId/activities";

export type ActivityGetParams = {
  [index: string]: any;
  id?: string;
  projectId?: string;
  environmentId?: string;
};

export type ActivityQueryParams = {
  [index: string]: any;
  projectId?: string;
  environmentId?: string;
};

type ActivityParameters = {
  [k: string]: string | null | ActivityParameters;
};

export default class Activity extends Ressource {
  readonly RESULT_SUCCESS = "success";
  readonly RESULT_FAILURE = "failure";
  readonly STATE_COMPLETE = "complete";
  readonly STATE_IN_PROGRESS = "in_progress";
  readonly STATE_PENDING = "pending";

  id: string;
  completion_percent: number;
  log: string;
  created_at: string;
  updated_at: string;
  cancelled_at: string;
  environments: string[];
  completed_at: string;
  parameters: ActivityParameters;
  project: string;
  state: string;
  result: string;
  started_at: string;
  type: string;
  payload: Record<string, any>;
  description: string;
  integration: string;
  timings: Record<string, string>;
  text: string;

  constructor(activity: APIObject, url: string) {
    super(url, paramDefaults, {}, activity, ["name", "ssl"]);
    this.id = "";
    this.completion_percent = 0;
    this.log = "";
    this.created_at = "";
    this.updated_at = "";
    this.cancelled_at = "";
    this.environments = [];
    this.completed_at = "";
    this.parameters = {};
    this.project = "";
    this.state = "";
    this.result = "";
    this.started_at = "";
    this.type = "";
    this.payload = [];
    this.description = "";
    this.integration = "";
    this.timings = {};
    this.text = "";
  }

  static async get(params: ActivityGetParams, customUrl?: string) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Activity>(
      customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`,
      { projectId, environmentId, id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: ActivityQueryParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<Activity>(
      customUrl ?? `${api_url}${_url}`,
      { projectId, environmentId },
      paramDefaults,
      queryParams
    );
  }

  /**
   * Wait for the activity to complete.
   *
   * @todo use the FutureInterface
   *
   * @param function  onPoll       A function that will be called every time
   *                                the activity is polled for updates. It
   *                                will be passed one argument: the
   *                                Activity object.
   * @param function  onLog        A function that will print new activity log
   *                                messages as they are received. It will be
   *                                passed one argument: the message as a
   *                                string.
   * @param int|float pollInterval The polling interval, in seconds.
   */
  async wait(
    onPoll?: (activity: Activity) => void,
    onLog?: (log: string) => void,
    pollInterval = 1
  ) {
    const log = this.log || "";

    if (onLog && log.trim().length) {
      onLog(`${log.trim()}\n`);
    }
    let { length } = log;
    let retries = 0;

    return new Promise<Activity>((resolve, reject) => {
      const interval = setInterval(() => {
        if (this.isComplete()) {
          resolve(this);
          clearInterval(interval);
        }

        this.refresh({ timeout: pollInterval + 5 })
          .then((activity: Activity) => {
            if (onPoll) {
              onPoll(activity);
            }

            if (onLog) {
              const newLog = (this.log || "").substring(length);

              onLog(`${newLog.trim()}\n`);
              // eslint-disable-next-line prefer-destructuring
              length = newLog.length;
            }
          })
          .catch(err => {
            if (err.message.indexOf("cURL error 28") !== -1 && retries <= 5) {
              retries++;
              return;
            }

            reject(err);
          });
      }, pollInterval * 1000);
    });
  }

  /**
   * Determine whether the activity is complete.
   *
   * @return bool
   */
  isComplete() {
    return this.getCompletionPercent() >= 100;
  }

  /**
   * Get the completion progress of the activity, in percent.
   *
   * @return int
   */
  getCompletionPercent() {
    return this.completion_percent;
  }

  /**
   * Restore the backup associated with this activity.
   *
   * @return Activity
   */
  async restore() {
    if (this.type !== "environment.backup") {
      throw new Error("Cannot restore activity (wrong type)");
    }
    if (!this.isComplete()) {
      throw new Error("Cannot restore backup (not complete)");
    }

    return this.runLongOperation("restore", "POST", {});
  }

  async getLogAt(start_at: number, delay: number): Promise<string> {
    if (delay) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(request(this.getLink("log"), "GET", { start_at }));
        }, delay);
      });
    }

    return request(this.getLink("log"), "GET", { start_at });
  }

  getLogs(callback: (log: any[] | string, response?: Response) => void) {
    let canceled = false;

    const cancel = () => {
      canceled = true;
    };

    return {
      cancel,
      exec: async () => {
        if (!this.hasLink("log")) {
          callback(this.log);
          return;
        }

        let starts_at = 0;
        let lastResponse;
        let attempts = 0;
        let delay = 0;

        while (
          (!lastResponse ||
            !lastResponse[lastResponse.data?.length - 1]?.seal) &&
          attempts < 5 &&
          // eslint-disable-next-line no-unmodified-loop-condition
          !canceled
        ) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const textJsonLog = await this.getLogAt(starts_at, delay);

            if (textJsonLog?.length) {
              delay = 0;
              attempts = 0;
              const logs = textJsonLog
                .split("\n")
                .filter(line => line.length)
                .map(log => JSON.parse(log));

              lastResponse = logs[logs.length - 1];
              starts_at++;
              callback(logs);

              if (logs[logs.length - 1].seal) {
                break;
              }
            } else {
              delay = 3000;
              attempts++;
            }
          } catch (response) {
            if (
              response instanceof Response &&
              (response.status < 500 || response.status > 599)
            ) {
              callback([], response);
            }

            delay = 3000;
            attempts++;
          }
        }
      }
    };
  }

  /**
   * Get a human-readable description of the activity.
   */
  getDescription() {
    const { type, payload } = this;

    switch (type) {
      case "project.domain.create":
        return `${payload.user.display_name} added domain ${payload.domain.name}`;
      case "project.domain.delete":
        return `${payload.user.display_name} deleted domain ${payload.domain.name}`;
      case "project.domain.update":
        return `${payload.user.display_name} updated domain ${payload.domain.name}`;
      case "project.modify.title":
        return `${payload.user.display_name} changed project name to ${payload.new_title}`;
      case "environment.activate":
        return `${payload.user.display_name} activated environment ${payload.environment.title}`;
      case "environment.backup":
        return `${payload.user.display_name} created a snapshot of ${payload.environment.title}`;
      case "environment.branch":
        return `${payload.user.display_name} branched ${payload.outcome.title} from ${payload.parent.title}`;
      case "environment.delete":
        return `${payload.user.display_name} deleted environment ${payload.environment.title}`;
      case "environment.deactivate":
        return `${payload.user.display_name} deactivated environment ${payload.environment.title}`;
      case "environment.initialize":
        return `${payload.user.display_name} initialized environment ${payload.outcome.title} with profile ${payload.profile}`;
      case "environment.merge":
        return `${payload.user.display_name} merged ${payload.outcome.title} into ${payload.environment.title}`;
      case "environment.push":
        return `${payload.user.display_name} pushed to ${payload.environment.title}`;
      case "environment.restore":
        return `${payload.user.display_name} restored ${
          payload.environment
        } from snapshot ${payload.backup_name.substr(0, 7)}`;
      case "environment.synchronize": {
        return `${payload.user.display_name} synced ${payload.outcome.title}'s ${payload.synchronization_type} with ${payload.environment.title}`;
      }
      case "environment.access.add":
        return `${payload.user.display_name} added ${payload.access.display_name} to ${payload.environment.title}`;
      case "environment.access.remove":
        return `${payload.user.display_name} removed ${payload.access.display_name} from ${payload.environment.title}`;
      case "environment.variable.create":
        return `${payload.user.display_name} added variable ${payload.variable.name}`;
      case "environment.variable.delete":
        return `${payload.user.display_name} deleted variable ${payload.variable.name}`;
      case "environment.variable.update":
        return `${payload.user.display_name} modified variable ${payload.variable.name}`;
      case "environment.update.http_access":
        return `${payload.user.display_name} updated HTTP Access settings on environment ${payload.environment.title}`;
      case "environment.update.smtp":
        return `${payload.user.display_name} updated SMTP settings on environment ${payload.environment.title}`;
      case "environment.route.create":
        return `${payload.user.display_name} added route ${payload.route.route}`;
      case "environment.route.delete":
        return `${payload.user.display_name} deleted route ${payload.route.route}`;
      case "environment.route.update":
        return `${payload.user.display_name} modified route ${payload.route.route}`;
      case "environment.subscription.update":
        return `${payload.user.display_name} modified subscription`;
      case "project.create":
        return `${payload.user.display_name} created a new project ${payload.outcome.title}`;
      default:
        return type;
    }
  }
}
