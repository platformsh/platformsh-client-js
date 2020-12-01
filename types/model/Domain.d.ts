export default class Domain extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(domain: any, url: any);
    id: string;
    name: string;
    _required: string[];
}
import Ressource from "./Ressource";
