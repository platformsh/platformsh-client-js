export default class Certificate extends Ressource {
    static query(params: any, customUrl: any): any;
    constructor(certificate: any, url: any);
    key: string;
    id: string;
    certificate: string;
    chain: any[];
    domains: any[];
    expires_at: string;
    updated_at: string;
    created_at: string;
    is_provisioned: boolean;
    issuer: any[];
    _required: string[];
}
import Ressource from "./Ressource";
