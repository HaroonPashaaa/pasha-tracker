/**
 * WebSocket Handler
 * 
 * Real-time wallet monitoring via WebSocket.
 */

import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { logger } from '../utils/logger';
import { SolanaClient } from '../indexer/solana-client';
import { createSolanaClient } from '../indexer/solana-client';

interface ClientConnection {
  ws: WebSocket;
  subscribedWallets: Set<string>;
  isAlive: boolean;
}

/**
 * WebSocketManager - Handles real-time wallet subscriptions
 */
export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection>;
  private solanaClient: SolanaClient;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.clients = new Map();
    this.solanaClient = createSolanaClient();
    
    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      logger.info(`WebSocket client connected: ${clientId} from ${req.socket.remoteAddress}`);

      const client: ClientConnection = {
        ws,
        subscribedWallets: new Set(),
        isAlive: true
      };

      this.clients.set(clientId, client);

      // Send welcome message
      this.sendToClient(client, {
        type: 'connection',
        status: 'connected',
        clientId
      });

      // Handle messages
      ws.on('message', (data) => {
        this.handleMessage(clientId, data.toString());
      });

      // Handle pong (heartbeat response)
      ws.on('pong', () => {
        client.isAlive = true;
      });

      // Handle close
      ws.on('close', () => {
        logger.info(`WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
      });
    });

    // Start heartbeat
    this.startHeartbeat();

    logger.info('WebSocket server initialized');
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(clientId: string, message: string): void {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(clientId);

      if (!client) return;

      switch (data.action) {
        case 'subscribe':
          this.handleSubscribe(client, data.walletAddress);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(client, data.walletAddress);
          break;

        case 'subscribe_multiple':
          if (Array.isArray(data.wallets)) {
            for (const wallet of data.wallets) {
              this.handleSubscribe(client, wallet);
            }
          }
          break;

        case 'ping':
          this.sendToClient(client, { type: 'pong' });
          break;

        default:
          this.sendToClient(client, {
            type: 'error',
            message: 'Unknown action'
          });
      }
    } catch (error) {
      logger.error('WebSocket message handling error:', error);
      const client = this.clients.get(clientId);
      if (client) {
        this.sendToClient(client, {
          type: 'error',
          message: 'Invalid message format'
        });
      }
    }
  }

  /**
   * Subscribe client to wallet updates
   */
  private handleSubscribe(client: ClientConnection, walletAddress: string): void {
    if (!walletAddress || walletAddress.length < 32) {
      this.sendToClient(client, {
        type: 'error',
        message: 'Invalid wallet address'
      });
      return;
    }

    client.subscribedWallets.add(walletAddress);

    // Subscribe to Solana account changes
    this.solanaClient.subscribeAccount(walletAddress, (accountInfo) => {
      this.sendToClient(client, {
        type: 'account_update',
        walletAddress,
        data: accountInfo
      });
    });

    this.sendToClient(client, {
      type: 'subscribed',
      walletAddress
    });

    logger.info(`Client subscribed to wallet: ${walletAddress}`);
  }

  /**
   * Unsubscribe client from wallet updates
   */
  private handleUnsubscribe(client: ClientConnection, walletAddress: string): void {
    client.subscribedWallets.delete(walletAddress);

    this.sendToClient(client, {
      type: 'unsubscribed',
      walletAddress
    });

    logger.info(`Client unsubscribed from wallet: ${walletAddress}`);
  }

  /**
   * Send message to specific client
   */
  private sendToClient(client: ClientConnection, data: any): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Broadcast message to all subscribed clients
   */
  broadcastToWallet(walletAddress: string, data: any): void {
    for (const [, client] of this.clients) {
      if (client.subscribedWallets.has(walletAddress)) {
        this.sendToClient(client, {
          type: 'transaction',
          walletAddress,
          data
        });
      }
    }
  }

  /**
   * Start heartbeat to detect disconnected clients
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [clientId, client] of this.clients) {
        if (!client.isAlive) {
          logger.info(`Terminating inactive client: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
          continue;
        }

        client.isAlive = false;
        client.ws.ping();
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Stop heartbeat and close all connections
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    for (const [, client] of this.clients) {
      client.ws.close();
    }

    this.clients.clear();
    this.wss.close();
    logger.info('WebSocket server shut down');
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connected client count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get subscription stats
   */
  getSubscriptionStats(): { totalClients: number; totalSubscriptions: number } {
    let totalSubscriptions = 0;
    for (const [, client] of this.clients) {
      totalSubscriptions += client.subscribedWallets.size;
    }

    return {
      totalClients: this.clients.size,
      totalSubscriptions
    };
  }
}

export default WebSocketManager;
