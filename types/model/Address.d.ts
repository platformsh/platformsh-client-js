export default class Address extends Ressource {
    static getQueryUrl(_url: any, id: any): string;
    static get(params: any, customUrl: any): any;
    static query(params: any): any;
    constructor(account: any);
    _queryUrl: string;
    id: string;
    country: string;
    name_line: string;
    premise: string;
    sub_premise: string;
    thoroughfare: string;
    administrative_area: string;
    sub_administrative_area: string;
    locality: string;
    dependent_locality: string;
    postal_code: string;
}
import Ressource from "./Ressource";
