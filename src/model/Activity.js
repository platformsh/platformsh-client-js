import Ressource from './Ressource';

const paramDefaults = {};

export default class Activity extends Ressource {
  constructor(activity, url) {
    super(url, paramDefaults, {}, activity, ['name', 'ssl']);
    this.id = '';
    this.completion_percent = 0;
    this.log = '';
    this.created_at = '';
    this.updated_at = '';
    this.environments = [];
    this.completed_at = '';
    this.parameters = [];
    this.project = '';
    this.state = '';
    this.result = '';
    this.started_at = '';
    this.type = '';
    this.payload = [];
    this.RESULT_SUCCESS = 'success';
    this.RESULT_FAILURE = 'failure';
    this.STATE_COMPLETE = 'complete';
    this.STATE_IN_PROGRESS = 'in_progress';
    this.STATE_PENDING = 'pending';
  }

  static get(params, url) {
    const { id, ...queryParams } = params;

    return super.get(`${url}/:id`, { id }, paramDefaults, queryParams);
  }

  static query(params, url) {
    return super.query(url, {}, paramDefaults, params);
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
  * @param int|float $pollInterval The polling interval, in seconds.
  */
  wait(onPoll, onLog, pollInterval = 1) {
    const log = this.log;

    if (onLog && log.trim().length) {
      onLog(`${log.trim()}\n`);
    }
    let length = log.length;
    let retries = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if(this.isComplete()) {
          resolve(this);
          clearInterval(interval);
        }

        this.refresh({ 'timeout': pollInterval + 5 }).then(activity => {
          if (onPoll) {
            onPoll(activity);
          }

          if (onLog) {
            const newLog = this.log.substring(length);

            onLog(`${newLog.trim()}\n`);
            length = newLog.length;
          }
        })
        .catch(err => {
          if (err.message.indexOf('cURL error 28') !== -1 && retries <= 5) {
            return retries++;
          }

          reject(err);
        });
      }, pollInterval * 1000000);
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
    return parseInt(this.completion_percent);
  }

  /**
  * Restore the backup associated with this activity.
  *
  * @return Activity
  */
  restore() {
    if (this.type !== 'environment.backup') {
      throw new Error('Cannot restore activity (wrong type)');
    }
    if (!this.isComplete()) {
      throw new Error('Cannot restore backup (not complete)');
    }

    return this.runLongOperation('restore', 'POST', {}, Activity);
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
      case 'project.domain.create':
        return `${payload['user']['display_name']} added domain ${payload['domain']['name']}`;
      case 'project.domain.delete':
        return `${payload['user']['display_name']} deleted domain ${payload['domain']['name']}`;
      case 'project.domain.update':
        return `${payload['user']['display_name']} updated domain ${payload['domain']['name']}`;
      case 'project.modify.title':
        return `${payload['user']['display_name']} changed project name to ${payload['new_title']}`;
      case 'environment.activate':
        return `${payload['user']['display_name']} activated environment ${payload['environment']['title']}`;
      case 'environment.backup':
        return `${payload['user']['display_name']} created a snapshot of ${payload['environment']['title']}`;
      case 'environment.branch':
        return `${payload['user']['display_name']} branched ${payload['outcome']['title']} from ${payload['parent']['title']}`;
      case 'environment.delete':
        return `${payload['user']['display_name']} deleted environment ${payload['environment']['title']}`;
      case 'environment.deactivate':
        return `${payload['user']['display_name']} deactivated environment ${payload['environment']['title']}`;
      case 'environment.initialize':
        return `${payload['user']['display_name']} initialized environment ${payload['outcome']['title']} with profile ${payload['profile']}`;
      case 'environment.merge':
        return `${payload['user']['display_name']} merged ${payload['outcome']['title']} into ${payload['environment']['title']}`;
      case 'environment.push':
        return `${payload['user']['display_name']} pushed to ${payload['environment']['title']}`;
      case 'environment.restore':
        return `${payload['user']['display_name']} restored ${payload['environment']} from snapshot ${payload['backup_name'].substr(0, 7)}`;
      case 'environment.synchronize':
        const syncedCode = !payload['synchronize_code'];
        let syncType = 'data';

        if(syncedCode && !payload['synchronize_data']) {
          syncType = 'code and data';
        } else if (syncedCode) {
          syncType = 'code';
        }
        return `${payload['user']['display_name']} synced ${payload['outcome']['title']}'s ${syncType} with ${payload['environment']['title']}`;
      case 'environment.access.add':
        return `${payload['user']['display_name']} added ${payload['access']['display_name']} to ${payload['environment']['title']}`;
      case 'environment.access.remove':
        return `${payload['user']['display_name']} removed ${payload['access']['display_name']} from ${payload['environment']['title']}`;
      case 'environment.variable.create':
        return `${payload['user']['display_name']} added variable ${payload['variable']['name']}`;
      case 'environment.variable.delete':
        return `${payload['user']['display_name']} deleted variable ${payload['variable']['name']}`;
      case 'environment.variable.update':
        return `${payload['user']['display_name']} modified variable ${payload['variable']['name']}`;
      case 'environment.update.http_access':
        return `${payload['user']['display_name']} updated HTTP Access settings on environment ${payload['environment']['title']}`;
      case 'environment.update.smtp':
        return `${payload['user']['display_name']} updated SMTP settings on environment ${payload['environment']['title']}`;
      case 'environment.route.create':
        return `${payload['user']['display_name']} added route ${payload['route']['route']}`;
      case 'environment.route.delete':
        return `${payload['user']['display_name']} deleted route ${payload['route']['route']}`;
      case 'environment.route.update':
        return `${payload['user']['display_name']} modified route ${payload['route']['route']}`;
      case 'environment.subscription.update':
        return `${payload['user']['display_name']} modified subscription`;
      case 'project.create':
        return `${payload['user']['display_name']} created a new project ${payload['outcome']['title']}`;
    }
    return type;
  }
}
