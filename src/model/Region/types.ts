import {components} from '../../types/model';
import Region from "./Region";

export interface RegionGetParams {
    [key: string]: any;
  };
  
  export interface RegionResponse {
    regions: Array<Region>
  };
  

export type RegionType = components['schemas']['Region'];
