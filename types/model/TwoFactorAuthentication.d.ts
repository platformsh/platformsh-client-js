export default class Account extends Ressource {
    static get(userId: any): any;
    static enroll(userId: any, secret: any, passcode: any): any;
    static reset(userId: any): any;
    static delete(userId: any): any;
    constructor(account: any);
    _queryUrl: string;
    issuer: string;
    account_name: string;
    secret: string;
    qr_code: string;
}
import Ressource from "./Ressource";
