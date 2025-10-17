export interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string;
  branch: string;
  event: string;
  created_at: string;
  updated_at: string;
  url: string;
  head_sha: string;
  head_commit: string;
  run_number: number;
  attempt: number;
}

export interface PipelineStats {
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  success_rate: number;
  avg_duration: string;
}

export interface Workflow {
  id: number;
  name: string;
  path: string;
  state: string;
  created_at: string;
  updated_at: string;
  url: string;
  badge_url: string;
}
