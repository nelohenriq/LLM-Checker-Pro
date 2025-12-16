export interface LLMModel {
  id: string;
  name: string;
  provider: string; // e.g., 'meta-llama', 'mistralai'
  parameters: string; // e.g., '7B', '70B'
  description: string;
  likes: number;
  downloads: number;
  tags: string[];
  lastUpdated: string;
  license: string;
  vramSize: string;
  releaseDate: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  module: 'CHECKER' | 'DB' | 'API' | 'SYSTEM';
  message: string;
}

export interface DashboardStats {
  totalModels: number;
  lastCheck: string;
  status: 'IDLE' | 'POLLING' | 'ERROR';
  dbSize: string;
  apiRequests: number;
  currentActivity?: string; // For real-time status updates
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  MODELS = 'MODELS',
  LOGS = 'LOGS',
  API = 'API',
  SETTINGS = 'SETTINGS'
}