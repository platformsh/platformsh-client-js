export default class Deployment extends Ressource {
    static get(params: {}, customUrl: any): any;
    constructor(deployment: any, url: any);
    webapps: {};
    services: {};
    workers: {};
    routes: {};
    id: string;
}
import Ressource from "./Ressource";
