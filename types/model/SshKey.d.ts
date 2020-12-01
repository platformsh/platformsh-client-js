export default class SshKey extends Ressource {
    static get(params: any): any;
    constructor(sshKey: any);
    _required: string[];
    _queryUrl: string;
    changed: string;
    id: string;
    title: string;
    key_id: number;
    fingerprint: string;
    value: string;
    /**
     * Validate an SSH public key.
     *
     * @param string value
     *
     * @return bool
     */
    validatePublicKey(value: any): boolean;
}
import Ressource from "./Ressource";
