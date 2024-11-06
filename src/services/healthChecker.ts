import { Connection } from '@solana/web3.js';
import axios from 'axios';
import { SOLANA_CONSTANTS } from '../utils/constants';

interface EndpointHealth {
  url: string;
  latency: number;
  isHealthy: boolean;
  lastChecked: number;
}

interface ApiHealth {
  name: string;
  url: string;
  isHealthy: boolean;
  latency: number;
  lastChecked: number;
}

class HealthChecker {
  private static instance: HealthChecker;
  private rpcHealth: Map<string, EndpointHealth>;
  private apiHealth: Map<string, ApiHealth>;
  private checkInterval: NodeJS.Timeout | null;
  private readonly CHECK_INTERVAL = 60000; // 1 minute

  private constructor() {
    this.rpcHealth = new Map();
    this.apiHealth = new Map();
    this.checkInterval = null;
    this.initializeHealthMaps();
  }

  public static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  private initializeHealthMaps(): void {
    // Initialize RPC endpoints
    SOLANA_CONSTANTS.RPC_ENDPOINTS.forEach(url => {
      this.rpcHealth.set(url, {
        url,
        latency: 0,
        isHealthy: false,
        lastChecked: 0
      });
    });

    // Initialize APIs
    const apis = [
      {
        name: 'SolanaTracker',
        url: SOLANA_CONSTANTS.SOLANA_TRACKER_API_URL
      },
      {
        name: 'CoinStats',
        url: SOLANA_CONSTANTS.COINSTATS_API_URL
      },
      {
        name: 'SolanaFM',
        url: SOLANA_CONSTANTS.SOLANA_FM_API_URL
      },
      {
        name: 'Solscan',
        url: 'https://public-api.solscan.io'
      }
    ];

    apis.forEach(api => {
      this.apiHealth.set(api.name, {
        name: api.name,
        url: api.url,
        isHealthy: false,
        latency: 0,
        lastChecked: 0
      });
    });
  }

  private async checkRPCEndpoint(url: string): Promise<EndpointHealth> {
    const startTime = Date.now();
    try {
      const connection = new Connection(url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await connection.getSlot({ signal: controller.signal });
      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;
      return {
        url,
        latency,
        isHealthy: true,
        lastChecked: Date.now()
      };
    } catch (error) {
      return {
        url,
        latency: 0,
        isHealthy: false,
        lastChecked: Date.now()
      };
    }
  }

  private async checkAPI(api: ApiHealth): Promise<ApiHealth> {
    const startTime = Date.now();
    try {
      const headers: Record<string, string> = { 'accept': 'application/json' };

      // Add specific API keys based on the API
      switch (api.name) {
        case 'SolanaTracker':
          headers['x-api-key'] = SOLANA_CONSTANTS.SOLANA_TRACKER_API_KEY;
          break;
        case 'CoinStats':
          headers['X-API-KEY'] = SOLANA_CONSTANTS.COINSTATS_API_KEY;
          break;
        case 'SolanaFM':
          headers['Authorization'] = `Bearer ${SOLANA_CONSTANTS.SOLANA_FM_API_KEY}`;
          break;
      }

      await axios.get(api.url, {
        headers,
        timeout: 5000
      });

      const latency = Date.now() - startTime;
      return {
        ...api,
        latency,
        isHealthy: true,
        lastChecked: Date.now()
      };
    } catch (error) {
      return {
        ...api,
        latency: 0,
        isHealthy: false,
        lastChecked: Date.now()
      };
    }
  }

  public async checkHealth(): Promise<void> {
    // Check RPC endpoints
    const rpcChecks = Array.from(this.rpcHealth.values()).map(endpoint =>
      this.checkRPCEndpoint(endpoint.url)
    );

    // Check APIs
    const apiChecks = Array.from(this.apiHealth.values()).map(api =>
      this.checkAPI(api)
    );

    // Wait for all checks to complete
    const [rpcResults, apiResults] = await Promise.all([
      Promise.all(rpcChecks),
      Promise.all(apiChecks)
    ]);

    // Update health maps
    rpcResults.forEach(result => {
      this.rpcHealth.set(result.url, result);
    });

    apiResults.forEach(result => {
      this.apiHealth.set(result.name, result);
    });

    // Log health status
    console.log('Health Check Results:');
    console.log('RPC Endpoints:', Array.from(this.rpcHealth.values()));
    console.log('APIs:', Array.from(this.apiHealth.values()));
  }

  public startHealthCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.checkHealth();
    this.checkInterval = setInterval(() => this.checkHealth(), this.CHECK_INTERVAL);
  }

  public stopHealthCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  public getFastestHealthyRPC(): string | null {
    const healthyEndpoints = Array.from(this.rpcHealth.values())
      .filter(endpoint => endpoint.isHealthy)
      .sort((a, b) => a.latency - b.latency);

    return healthyEndpoints[0]?.url || null;
  }

  public getHealthyAPIs(): string[] {
    return Array.from(this.apiHealth.values())
      .filter(api => api.isHealthy)
      .map(api => api.name);
  }

  public getEndpointHealth(url: string): EndpointHealth | undefined {
    return this.rpcHealth.get(url);
  }

  public getApiHealth(name: string): ApiHealth | undefined {
    return this.apiHealth.get(name);
  }
}

export const healthChecker = HealthChecker.getInstance();