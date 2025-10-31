import { Price, RouteConfig } from "x402/types";
import { Network } from 'x402-next';

export const networkConfigs: Record<string, RouteConfig> = {
  'solana-devnet': {
    price: '$0.01' as Price,
    network: 'solana-devnet' as Network,
    config: {
      description: 'Access to protected content on solana devnet'
    }
  } as RouteConfig,
  'solana': {
    price: '$0.01' as Price,
    network: 'solana' as Network,
    config: {
      description: 'Access to protected content on solana mainnet'
    }
  } as RouteConfig,
  'base': {
    price: '$0.01' as Price,
    network: 'base' as Network,
    config: {
      description: 'Access to protected content on base mainnet'
    }
  } as RouteConfig,
  'base-sepolia': {
    price: '$0.01' as Price,
    network: 'base-sepolia' as Network,
    config: {
      description: 'Access to protected content on base-sepolia'
    }
  } as RouteConfig,
  'avalanche': {
    price: '$0.01' as Price,
    network: 'avalanche' as Network,
    config: {
      description: 'Access to protected content on avalanche mainnet'
    }
  } as RouteConfig,
  'avalanche-fuji': {
    price: '$0.01' as Price,
    network: 'avalanche-fuji' as Network,
    config: {
      description: 'Access to protected content on avalanche-fuji'
    }
  } as RouteConfig,
  'sei': {
    price: '$0.01' as Price,
    network: 'sei' as Network,
    config: {
      description: 'Access to protected content on sei mainnet'
    }
  } as RouteConfig,
  'sei-testnet': {
    price: '$0.01' as Price,
    network: 'sei-testnet' as Network,
    config: {
      description: 'Access to protected content on sei-testnet'
    }
  } as RouteConfig,
  'polygon': {
    price: '$0.01' as Price,
    network: 'polygon' as Network,
    config: {
      description: 'Access to protected content on polygon mainnet'
    }
  } as RouteConfig,
  'polygon-amoy': {
    price: '$0.01' as Price,
    network: 'polygon-amoy' as Network,
    config: {
      description: 'Access to protected content on polygon amoy testnet'
    }
  } as RouteConfig,
  'peaq': {
    price: '$0.01' as Price,
    network: 'peaq' as Network,
    config: {
      description: 'Access to protected content on peaq mainnet'
    }
  } as RouteConfig,
};

export function getNetworkConfig(network: string): RouteConfig | undefined {
  return networkConfigs[network];
}

export function getPayToAddress(network: string): string | undefined {
  const payToEVM = process.env.EVM_RECEIVE_PAYMENTS_ADDRESS;
  const payToSVM = process.env.SVM_RECEIVE_PAYMENTS_ADDRESS;
  
  if (network === 'solana' || network === 'solana-devnet') {
    return payToSVM;
  }
  return payToEVM;
}

async function getRequestedAmount(request: Request, defaultAmount: Price): Promise<string> {
  const contentLength = request.headers.get('content-length');
  const contentType = request.headers.get('content-type');
  
  if (!contentLength || contentLength === '0' || !contentType?.includes('application/json')) {
    return convertPriceToString(defaultAmount);
  }
  
  try {
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();
    
    if (body.amount && typeof body.amount === 'number' && body.amount > 0) {
      return `$${body.amount.toFixed(2)}`;
    }
    
    return convertPriceToString(defaultAmount);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return convertPriceToString(defaultAmount);
    }
    throw error;
  }
}

function convertPriceToString(price: Price): string {
  if (typeof price === 'string') {
    return price;
  }
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }
  return '$0.01';
}

export async function getDynamicConfig(request: Request, network: string): Promise<RouteConfig | undefined> {
  const config = getNetworkConfig(network);
  if (!config) return undefined;
  
  const requestedAmount = await getRequestedAmount(request, config.price);
  return { ...config, price: requestedAmount };
}

