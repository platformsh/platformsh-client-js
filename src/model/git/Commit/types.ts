import {components} from 'src/types/model'

export type CommitType = components['schemas']['Commit']

export interface CommitParams {
    projectId?: string,
    [index: string]: any
  }
