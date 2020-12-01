export default class Order extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any): any;
    constructor(account: any);
    id: string;
    status: string;
    owner: string;
    address: {};
    vat_number: number;
    billing_period_start: string;
    billing_period_end: string;
    total: number;
    components: {};
    currency: string;
    invoice_url: string;
    line_items: any[];
}
import Ressource from "./Ressource";
