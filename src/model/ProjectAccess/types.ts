import {components} from '../../types/model';

export interface ProjectAccessQueryParams {
    projectId: string;
    [key: string]: any;
  };

export type ProjectAccessType = components['schemas']['ProjectAccess'];