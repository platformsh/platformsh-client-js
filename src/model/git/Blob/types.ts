import {components} from 'src/types/model'

export type BlobType = components['schemas']['Blob']

export type BlobParams = {
    projectId: string,
    sha: string
  };
