import {components} from '../../types/model';

export interface DomainGetParams {
    name: string,
    projectId?: string,
    [index: string]: any
};
  
export interface DomainQueryParams {
    projectId: string,
    [index: string]: any
};

export type DomaineType = components['schemas']['Domain'];