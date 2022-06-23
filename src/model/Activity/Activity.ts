import { APIObject } from "../Ressource";
import { getConfig } from "../../config";
import request from "../../api";
import { ActivityGetParams, ActivityQueryParams, ActivityType } from "./types";
import { autoImplementWithResources } from "../utils";
import { CurrentUserType } from "../Account";
import { DomainType } from "../Domain";
import Environment from "../Environment";
import Variable from "../Variable";
import Project from "../Project";

const paramDefaults = {};
const _url = "/projects/:projectId/environments/:environmentId/activities";

type ActivityRoutePayload = {
  route: {
    route: string
  }
}

export default class Activity extends  autoImplementWithResources()<ActivityType>() {
  readonly RESULT_SUCCESS = "success";
  readonly RESULT_FAILURE = "failure";
  readonly STATE_COMPLETE = "complete";
  readonly STATE_IN_PROGRESS = "in_progress";
  readonly STATE_PENDING = "pending";


  constructor(activity: APIObject, url: string) {
    super(url, paramDefaults, {}, activity, ["name", "ssl"]);
  }

  static get(params: ActivityGetParams, customUrl?: string) {
    const { projectId, environmentId, id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Activity>(
      customUrl ? `${customUrl}/:id` : `${api_url}${_url}/:id`,
      { projectId, environmentId, id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: ActivityQueryParams, customUrl?: string) {
    const { projectId, environmentId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._query<Activity>(
      customUrl || `${api_url}${_url}`,
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
  wait(onPoll: (activity: Activity) => void, onLog: (log: string) => void, pollInterval = 1) {
    const log = this.log || "";

    if (onLog && log.trim().length) {
      onLog(`${log.trim()}\n`);
    }
    let length = log.length;
    let retries = 0;

    return new Promise((resolve, reject) => {
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
              length = newLog.length;
            }
          })
          .catch(err => {
            if (err.message.indexOf("cURL error 28") !== -1 && retries <= 5) {
              return retries++;
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
  restore() {
    if (this.type !== "environment.backup") {
      throw new Error("Cannot restore activity (wrong type)");
    }
    if (!this.isComplete()) {
      throw new Error("Cannot restore backup (not complete)");
    }

    return this.runLongOperation("restore", "POST", {});
  }

  getLogAt(start_at: number, delay: number): Promise<string> {
    if (delay) {
      return new Promise(resolve => {
        setTimeout(
          () => resolve(request(this.getLink("log"), "GET", { start_at })),
          delay
        );
      });
    }

    return request(this.getLink("log"), "GET", { start_at });
  }

  getLogs(callback: (log: Array<string> | string, response?: Response) => void) {
    let canceled = false;

    const cancel = () => {
      canceled = true;
    };

    return {
      cancel,
      exec: async () => {
        if (!this.hasLink("log")) {
          return callback(this.log);
        }

        let starts_at = 0;
        let lastResponse;
        let attempts = 0;
        let delay = 0;

        while (
          (!lastResponse || !lastResponse[lastResponse.data.length - 1].seal) &&
          attempts < 5 &&
          !canceled
        ) {
          try {
            const textJsonLog = await this.getLogAt(starts_at, delay);

            if (!textJsonLog || !textJsonLog.length) {
              delay = 3000;
              attempts++;
              continue;
            }

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
          } catch (response) {
            if (response instanceof Response && (response.status < 500 || response.status > 599)) {
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
   *
   * @return string
   */
  getDescription() {
    const type = this.type;
    const payload = this.payload;

    switch (type) {
      case "project.domain.create":
        return `${(payload.user as CurrentUserType).display_name} added domain ${
          (payload.domain as DomainType).name 
        }`;
      case "project.domain.delete":
        return `${(payload.user as CurrentUserType).display_name} deleted domain ${
          (payload.domain as DomainType).name
        }`;
      case "project.domain.update":
        return `${(payload.user as CurrentUserType).display_name} updated domain ${
          (payload.domain as DomainType).name
        }`;
      case "project.modify.title":
        return `${(payload.user as CurrentUserType).display_name} changed project name to ${
          payload.new_title
        }`;
      case "environment.activate":
        return `${(payload.user as CurrentUserType).display_name} activated environment ${
          (payload.environment as Environment).title
        }`;
      case "environment.backup":
        return `${(payload.user as CurrentUserType).display_name} created a snapshot of ${
          (payload.environment as Environment).title
        }`;
      case "environment.branch":
        return `${(payload.user as CurrentUserType).display_name} branched ${
          (payload.outcome as Project).title
        } from ${(payload.parent as Environment).title}`;
      case "environment.delete":
        return `${(payload.user as CurrentUserType).display_name} deleted environment ${
          (payload.environment as Environment).title
        }`;
      case "environment.deactivate":
        return `${(payload.user as CurrentUserType).display_name} deactivated environment ${
          (payload.environment as Environment).title
        }`;
      case "environment.initialize":
        return `${(payload.user as CurrentUserType).display_name} initialized environment ${
          (payload.outcome as Project).title
        } with profile ${payload.profile}`; // eslint-disable-line max-len
      case "environment.merge":
        return `${(payload.user as CurrentUserType).display_name} merged ${
          (payload.outcome as Project).title
        } into ${(payload.environment as Environment).title}`;
      case "environment.push":
        return `${(payload.user as CurrentUserType).display_name} pushed to ${
          (payload.environment as Environment).title
        }`;
      case "environment.restore":
        return `${(payload.user as CurrentUserType).display_name} restored ${
          (payload.environment as Environment)
        } from snapshot ${(payload.backup_name as string).substr(0, 7)}`; // eslint-disable-line max-len
      case "environment.synchronize":
        const syncedCode = !payload["synchronize_code"];
        let syncType = "data";

        if (syncedCode && !payload["synchronize_data"]) {
          syncType = "code and data";
        } else if (syncedCode) {
          syncType = "code";
        }
        return `${(payload.user as CurrentUserType).display_name} synced ${
          (payload.outcome as Project).title
        }'s ${syncType} with ${(payload.environment as Environment).title}`; // eslint-disable-line max-len
      case "environment.access.add":
        return `${(payload.user as CurrentUserType).display_name} added ${
          (payload.access as CurrentUserType).display_name
        } to ${(payload.environment as Environment).title}`;
      case "environment.access.remove":
        return `${(payload.user as CurrentUserType).display_name} removed ${
          (payload.access as CurrentUserType).display_name
        } from ${(payload.environment as Environment).title}`;
      case "environment.variable.create":
        return `${(payload.user as CurrentUserType).display_name} added variable ${
          (payload.variable as Variable).name
        }`;
      case "environment.variable.delete":
        return `${(payload.user as CurrentUserType).display_name} deleted variable ${
          (payload.variable as Variable).name
        }`;
      case "environment.variable.update":
        return `${(payload.user as CurrentUserType).display_name} modified variable ${
          (payload.variable as Variable).name
        }`;
      case "environment.update.http_access":
        return `${
          (payload.user as CurrentUserType).display_name
        } updated HTTP Access settings on environment ${
          (payload.environment as Environment).title
        }`;
      case "environment.update.smtp":
        return `${
          (payload.user as CurrentUserType).display_name
        } updated SMTP settings on environment ${(payload.environment as Environment).title}`;
      case "environment.route.create":
        return `${(payload.user as CurrentUserType).display_name} added route ${
          (payload as ActivityRoutePayload).route.route
        }`;
      case "environment.route.delete":
        return `${(payload.user as CurrentUserType).display_name} deleted route ${
          (payload as ActivityRoutePayload).route.route
        }`;
      case "environment.route.update":
        return `${(payload.user as CurrentUserType).display_name} modified route ${
          (payload as ActivityRoutePayload).route.route
        }`;
      case "environment.subscription.update":
        return `${(payload.user as CurrentUserType).display_name} modified subscription`;
      case "project.create":
        return `${(payload.user as CurrentUserType).display_name} created a new project ${
          (payload.outcome as Project).title
        }`;
    }
    return type;
  }
}
