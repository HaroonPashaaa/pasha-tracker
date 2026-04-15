/**
 * Example: Basic Usage
 * 
 * This example demonstrates basic usage of Pasha Tracker API.
 */

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'your-api-key';

// Create axios instance with auth
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
});

async function examples() {
  try {
    // 1. Trace wallet origin
    console.log('🔍 Tracing wallet origin...');
    const traceResult = await client.post('/trace/origin', {
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      maxDepth: 5
    });
    console.log('Trace result:', traceResult.data);

    // 2. Verify exchange address
    console.log('\n🏦 Verifying exchange address...');
    const verifyResult = await client.get('/exchanges/verify/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
    console.log('Verification:', verifyResult.data);

    // 3. Detect bundles
    console.log('\n📦 Detecting bundles...');
    const bundleResult = await client.post('/bundles/detect', {
      tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      timeWindow: '24h',
      minWallets: 3
    });
    console.log('Bundles:', bundleResult.data);

    // 4. Get wallet profile
    console.log('\n👤 Getting wallet profile...');
    const profileResult = await client.get('/wallet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/profile');
    console.log('Profile:', profileResult.data);

    // 5. Get API stats
    console.log('\n📊 Getting API stats...');
    const statsResult = await client.get('/stats');
    console.log('Stats:', statsResult.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run examples
examples();
