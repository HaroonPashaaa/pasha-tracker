/**
 * Example: WebSocket Real-Time Monitoring
 * 
 * This example demonstrates WebSocket usage for real-time wallet monitoring.
 */

import WebSocket from 'ws';

const WS_URL = 'ws://localhost:3000/ws';
const JWT_TOKEN = 'your-jwt-token';

// Connect to WebSocket
const ws = new WebSocket(WS_URL);

// Handle connection
ws.on('open', () => {
  console.log('✅ Connected to WebSocket');
  
  // Authenticate
  ws.send(JSON.stringify({
    action: 'auth',
    token: JWT_TOKEN
  }));
});

// Handle messages
ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  
  switch (message.type) {
    case 'connected':
      console.log('🎉', message.message);
      break;
      
    case 'auth':
      if (message.status === 'success') {
        console.log('🔓 Authenticated as:', message.userId);
        
        // Subscribe to wallet
        ws.send(JSON.stringify({
          action: 'subscribe',
          walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
        }));
      } else {
        console.log('❌ Authentication failed:', message.message);
      }
      break;
      
    case 'subscribed':
      console.log('📡 Subscribed to:', message.walletAddress);
      break;
      
    case 'transaction':
      console.log('\n💸 New Transaction!');
      console.log('Wallet:', message.walletAddress);
      console.log('Transaction:', message.transaction);
      console.log('Time:', message.timestamp);
      break;
      
    case 'alert':
      console.log('\n🚨 Alert!');
      console.log(message.alert);
      break;
      
    case 'pong':
      // Heartbeat response
      break;
      
    default:
      console.log('Received:', message);
  }
});

// Handle errors
ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

// Handle close
ws.on('close', () => {
  console.log('🔌 Disconnected from WebSocket');
});

// Send periodic ping
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ action: 'ping' }));
  }
}, 30000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Closing connection...');
  ws.close();
  process.exit(0);
});
