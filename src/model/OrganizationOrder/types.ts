import {components} from '../../types/model';

export interface OrganizationOrderGetParams {
    id: string;
    organizationId: string;
    [key: string]: any;
  };
  
export interface OrganizationOrderQueryParams {
    organizationId: string;
    [key: string]: any;
};


export type OrderType = components['schemas']['Order'];
