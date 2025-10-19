export interface GitOpsApp {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  repo_url: string;
  branch: string;
  path: string;
  namespace: string;
  sync_status: 'Synced' | 'OutOfSync' | 'Unknown';
  last_synced: string | null;
}

export interface CreateGitOpsAppRequest {
  name: string;
  repo_url: string;
  branch: string;
  path: string;
  namespace: string;
}
