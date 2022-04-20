import {components} from '../../types/model';

export interface VariableGetParams {
    id: string;
    projectId: string,
    environmentId: string,
    [key: string]: any;
  };
  
export interface VariableQueryParams {
    projectId: string,
    environmentId: string,
    [key: string]: any;
};

export type EnvironmentVariableType = components['schemas']['EnvironmentVariable'];