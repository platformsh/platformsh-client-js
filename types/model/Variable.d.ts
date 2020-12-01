export default class Variable extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(variable: any, url: any);
    id: string;
    name: string;
    project: string;
    environment: string;
    value: string;
    is_enabled: boolean;
    created_at: string;
    updated_at: string;
    inherited: boolean;
    is_json: string;
    is_sensitive: string;
    is_inheritable: boolean;
    /**
     * Disable the variable.
     *
     * This is only useful if the variable is both inherited and enabled.
     * Non-inherited variables can be deleted.
     *
     * @return Result
     */
    disable(): any;
}
import Ressource from "./Ressource";
