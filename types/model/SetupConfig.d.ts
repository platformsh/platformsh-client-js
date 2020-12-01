export default class SetupConfig extends Ressource {
    static get({ service, format }: {
        service: any;
        format?: string;
    }, customUrl: any): any;
    constructor(setupConfig: any, url?: string);
    _queryUrl: string;
    app: string;
    service: string;
}
import Ressource from "./Ressource";
