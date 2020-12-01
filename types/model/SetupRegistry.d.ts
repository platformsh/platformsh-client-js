export default class SetupRegistry extends Ressource {
    static get(params: any, customUrl: any): any;
    constructor(registry: any, url?: string, modifiableField?: any[]);
    _queryUrl: string;
    description: string;
    repo_name: string;
    disk: any;
    docs: {};
    endpoint: string;
    min_disk_size: any;
    name: string;
    runtime: any;
    type: string;
    versions: {};
}
import Ressource from "./Ressource";
