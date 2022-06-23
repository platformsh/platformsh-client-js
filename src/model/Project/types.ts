import {components} from '../../types/model';

export interface ProjectGetParams {
    id: string;
    [key: string]: any;
  };
  
export interface Repository {
    client_ssh_key: string;
    url: string;
}

export type ProjectType = components['schemas']['Project'];
export type AccountProjectType = components['schemas']['ProjectLink'];