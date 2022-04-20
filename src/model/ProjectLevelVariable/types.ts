import {components} from '../../types/model';

export interface ProjectLevelVariableGetParams {
    name: string;
    projectId: string;
    [key: string]: any;
  };
  
  export interface ProjectLevelVariableQueryParams {
    projectId: string;
    [key: string]: any;
  };

export type ProjectVariableType = components['schemas']['ProjectVariable'];