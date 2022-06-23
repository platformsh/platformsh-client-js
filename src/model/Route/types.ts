import {components} from '../../types/model';

export interface RouteGetParams {
    id: string;
    projectId: string,
    environmentId: string,
    [key: string]: any;
  };
  
export interface RouteQueryParams {
    projectId: string,
    environmentId: string,
    [key: string]: any;
};

export type RouteType = components["schemas"]["Route"];