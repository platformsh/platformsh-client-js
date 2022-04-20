import {components} from '../../types/model';

export interface OrganizationGetParams {
    id: string;
    [key: string]: any;
  };
  
export interface OrganizationQueryParams {
    userId?: string;
    [key: string]: any;
};

export type OrganizationType = components['schemas']['Organization'];