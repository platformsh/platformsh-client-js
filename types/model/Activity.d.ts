export default class Activity extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(activity: any, url: any);
    id: string;
    completion_percent: number;
    log: string;
    created_at: string;
    updated_at: string;
    environments: any[];
    completed_at: string;
    parameters: any[];
    project: string;
    state: string;
    result: string;
    started_at: string;
    type: string;
    payload: any[];
    RESULT_SUCCESS: string;
    RESULT_FAILURE: string;
    STATE_COMPLETE: string;
    STATE_IN_PROGRESS: string;
    STATE_PENDING: string;
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
    wait(onPoll: any, onLog: any, pollInterval?: number): any;
    /**
     * Determine whether the activity is complete.
     *
     * @return bool
     */
    isComplete(): boolean;
    /**
     * Get the completion progress of the activity, in percent.
     *
     * @return int
     */
    getCompletionPercent(): number;
    /**
     * Restore the backup associated with this activity.
     *
     * @return Activity
     */
    restore(): any;
    getLogAt(start_at: any, delay: any): any;
    getLogs(callback: any): {
        cancel: () => void;
        exec: () => Promise<any>;
    };
    /**
     * Get a human-readable description of the activity.
     *
     * @return string
     */
    getDescription(): string;
}
import Ressource from "./Ressource";
