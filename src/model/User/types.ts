import {components} from '../../types/model';

export interface UserGetParams {
    id: string;
    [key: string]: any;
  };
  
  export interface UserQueryParams {
    projectId: string,
    environmentId: string,
    [key: string]: any;
  };
  
  export type UserType = components['schemas']['User'];