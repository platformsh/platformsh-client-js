import {components} from '../../types/model';

export interface EnvironmentTypeGetParams {
    id: string;
    [key: string]: any;
  };
  
  export interface EnvironmentTypeQueryParams {
    projectId: string;
    [key: string]: any;
  };

export type EnvironmentTypeAccessType = components['schemas']['EnvironmentTypeAccess'];
