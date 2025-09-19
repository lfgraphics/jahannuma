// Shared domain types used across the app

export interface ShaerFields {
  sher?: string[];
  shaer: string;
  // Some data sources provide a single string with line breaks, others provide an array
  ghazalHead: string | string[];
  ghazal?: string[];
  // Some data sources provide a single string with line breaks, others provide an array
  unwan?: string | string[];
  likes?: number;
  comments?: number;
  shares?: number;
  id?: string;
}

export interface Shaer {
  fields: ShaerFields;
  id: string;
  createdTime: string;
}

export interface Rubai {
  fields: {
    shaer: string;
    unwan: string;
    body: string;
    likes: number;
    comments: number;
    shares: number;
    id: string;
  };
  id: string;
  createdTime: string;
}
