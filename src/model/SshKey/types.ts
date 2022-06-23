import {components} from '../../types/model';

export interface SshKeyGetParams {
    id: string;
    [key: string]: any;
};

export type SshKeyType = components['schemas']['SSHKey'];