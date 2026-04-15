/**
 * WebSocket Server
 * 
 * Real-time updates for wallet monitoring.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from '../core/utils/logger';
import jwt from 'jsonwebtoken';

interface Client {
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
  isAlive: boolean;
}

/**
 * WebSocketManager - Handles real-time connections
 */
export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, Client>;
  private interval: NodeJS.Timeout | null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.clients = new Map();
    this.interval = null;
    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on('connection', (ws, req) => {
      logger.info(`WebSocket connection from ${req.socket.remoteAddress}`);
      
      const client: Client = {
        ws,
        subscriptions: new Set(),
        isAlive: true
      };
      
      this.clients.set(ws, client);

      // Authentication
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(client, message);
        } catch (error) {
          ws.send(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });

      // Heartbeat
      ws.on('pong', () => {
        client.isAlive = true;
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info('WebSocket client disconnected');
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({ 
        type: 'connected',
        message: 'WebSocket connected. Send auth token to subscribe.' 
      }));
    });

    // Start heartbeat check
    this.interval = setInterval(() => {
      this.clients.forEach((client, ws) => {
        if (!client.isAlive) {
          ws.terminate();
          this.clients.delete(ws);
          return;
        }
        client.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private handleMessage(client: Client, message: any): void {
    switch (message.action) {
      case 'auth':
        this.authenticate(client, message.token);
        break;
      case 'subscribe':
        this.subscribe(client, message.walletAddress);
        break;
      case 'unsubscribe':
        this.unsubscribe(client, message.walletAddress);
        break;
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong' }));
        break;
      default:
        client.ws.send(JSON.stringify({ error: 'Unknown action' }));
    }
  }

  private authenticate(client: Client, token: string): void {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET not configured');
      }

      const decoded = jwt.verify(token, secret) as any;
      client.userId = decoded.id;
      
      client.ws.send(JSON.stringify({ 
        type: 'auth',
        status: 'success',
        userId: decoded.id 
      }));
      
      logger.info(`WebSocket authenticated: ${decoded.id}`);
    } catch (error) {
      client.ws.send(JSON.stringify({ 
        type: 'auth',
        status: 'error',
        message: 'Invalid token' 
      }));
    }
  }

  private subscribe(client: Client, walletAddress: string): void {
    if (!client.userId) {
      client.ws.send(JSON.stringify({ 
        error: 'Authentication required' 
      }));
      return;
    }

    client.subscriptions.add(walletAddress);
    
    client.ws.send(JSON.stringify({
      type: 'subscribed',
      walletAddress
    }));
    
    logger.info(`Client subscribed to: ${walletAddress}`);
  }

  private unsubscribe(client: Client, walletAddress: string): void {
    client.subscriptions.delete(walletAddress);
    
    client.ws.send(JSON.stringify({
      type: 'unsubscribed',
      walletAddress
    }));
  }

  /**
   * Broadcast transaction to subscribed clients
   */
  broadcastTransaction(walletAddress: string, transaction: any): void {
    const message = JSON.stringify({
      type: 'transaction',
      walletAddress,
      transaction,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client) => {
      if (client.subscriptions.has(walletAddress)) {
        client.ws.send(message);
      }
    });
  }

  /**
   * Broadcast alert to all authenticated clients
   */
  broadcastAlert(alert: any): void {
    const message = JSON.stringify({
      type: 'alert',
      alert,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client) => {
      if (client.userId) {
        client.ws.send(message);
      }
    });
  }

  /**
   * Get connected client count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Shutdown WebSocket server
   */
  shutdown(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.wss.close();
    logger.info('WebSocket server shut down');
  }
}

export default WebSocketManager;
