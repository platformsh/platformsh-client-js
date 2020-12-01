export default class Voucher extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any): any;
    constructor(account: any);
    currency: string;
    discounted_orders: any[];
    uuid: string;
    vouchers: any[];
    vouchers_applied: number;
    vouchers_remaining_balance: number;
    vouchers_total: number;
}
import Ressource from "./Ressource";
