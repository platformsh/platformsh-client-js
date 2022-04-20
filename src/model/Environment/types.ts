import {components} from '../../types/model';

export interface EnvironmentGetParams {
    projectId: string;
    id: string;
    [key: string]: any;
};
  
export interface EnvironmentQueryParams {
    projectId: string;
    [key: string]: any;
};

export type EnvironmentType = components['schemas']['Environment'];