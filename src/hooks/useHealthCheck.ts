import { useState, useEffect } from 'react';
import { healthChecker } from '../services/healthChecker';

export function useHealthCheck() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      healthChecker.startHealthCheck();
      setIsInitialized(true);
    }

    return () => {
      healthChecker.stopHealthCheck();
    };
  }, [isInitialized]);

  return {
    getFastestRPC: () => healthChecker.getFastestHealthyRPC(),
    getHealthyAPIs: () => healthChecker.getHealthyAPIs(),
    getEndpointHealth: (url: string) => healthChecker.getEndpointHealth(url),
    getApiHealth: (name: string) => healthChecker.getApiHealth(name)
  };
}