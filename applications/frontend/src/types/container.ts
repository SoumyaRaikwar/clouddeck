export interface Container {
  containerId: string;
  name: string;
  status: string;
  image: string;
  cpuPercent: number;
  memoryUsage: number;
  memoryLimit: number;
}

export interface ContainerLogs {
  logs: string;
}
