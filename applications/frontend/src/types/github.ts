export interface GitHubPR {
  id: number;
  title: string;
  url: string;
  state: string;
  created_at: string;
  updated_at: string;
  repo: string;
  labels: string;
}

export interface GitHubIssue {
  id: number;
  title: string;
  body: string;
  url: string;
  state: string;
  created_at: string;
  labels: string;
  assignee?: string;
}

export interface SyncPRsRequest {
  token: string;
  username: string;
  project_id: number;
}

export interface SyncIssuesRequest {
  token: string;
  owner: string;
  repo: string;
  project_id: number;
}
