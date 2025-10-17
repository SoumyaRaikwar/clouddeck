export interface Pod {
  name: string;
  namespace: string;
  status: string;
  restarts: number;
  age: string;
  node: string;
  ip: string;
  image: string;
  cpu_request: string;
  mem_request: string;
}

export interface Deployment {
  name: string;
  namespace: string;
  replicas: number;
  ready_replicas: number;
  updated_replicas: number;
  available_replicas: number;
  age: string;
  image: string;
}

export interface Service {
  name: string;
  namespace: string;
  type: string;
  cluster_ip: string;
  ports: string[];
  age: string;
}

export interface Namespace {
  name: string;
  status: string;
  age: string;
}
