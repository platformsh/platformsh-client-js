export default class Route extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(route: any, url: any);
    id: string;
    project: string;
    environment: string;
    route: {};
    cache: {};
    ssi: any[];
    upstream: string;
    to: string;
    type: string;
}
import Ressource from "./Ressource";
