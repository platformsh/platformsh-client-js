import {components} from '../../types/model';

export interface OrganizationMemberGetParams {
    id: string;
    organizationId: string;
    [key: string]: any;
  };
  
export interface OrganizationMemberQueryParams {
    organizationId: string;
    [key: string]: any;
};
  

export type OrganizationMemberType = components['schemas']['OrganizationMember'];