import {components} from '../../types/model';

export interface CertificateQueryParams {
    projectId?: string,
    [index: string]: any
};

export type CertificateType = components['schemas']['Certificate'];