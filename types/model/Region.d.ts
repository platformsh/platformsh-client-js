export default class Region extends Ressource {
    static query(params: any): any;
    constructor(region: any);
    _queryUrl: string;
    id: string;
    available: boolean;
    endpoint: string;
    label: string;
    private: boolean;
    provider: string;
    zone: string;
}
import Ressource from "./Ressource";
