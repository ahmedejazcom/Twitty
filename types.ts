export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Tweet {
  id: string;
  text: string;
  sources: GroundingSource[];
  timestamp: string;
  originalSummary: string;
}

export interface NewsUpdate {
  summary: string;
  sources: GroundingSource[];
}
