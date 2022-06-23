import {components} from '../../types/model'

export interface ActivityGetParams {
    id?: string,
    projectId?: string,
    environmentId?: string,
    [index: string]: any
  };
  
  export interface ActivityQueryParams {
    projectId?: string,
    environmentId?: string,
    [index: string]: any
  };

export type ActivityType = components['schemas']['Activity'];
