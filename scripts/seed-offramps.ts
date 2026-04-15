/**
 * Seed Off-Ramp Addresses
 * 
 * Populates database with known fiat off-ramp addresses.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const offRampAddresses = [
  // Binance withdrawals
  { address: 'BinanceWithdraw1Example111111111111111111111', name: 'Binance_Withdrawal_1' },
  { address: 'BinanceWithdraw2Example111111111111111111111', name: 'Binance_Withdrawal_2' },
  
  // Coinbase withdrawals
  { address: 'CoinbaseWithdraw1Example11111111111111111111', name: 'Coinbase_Withdrawal_1' },
  
  // Kraken withdrawals
  { address: 'KrakenWithdraw1Example1111111111111111111111', name: 'Kraken_Withdrawal_1' },
  
  // Burn addresses
  { address: '1nc1nerator11111111111111111111111111111111', name: 'Solana_Burn_Address' },
  { address: 'Burn111111111111111111111111111111111111111', name: 'Token_Burn_Address' },
];

async function seedOffRamps() {
  console.log('Note: Off-ramp addresses are tracked in-memory in OffRampDetector');
  console.log('For database persistence, add to ExchangeWallet with walletType="withdrawal"');
  
  // Add as exchange wallets with withdrawal type
  for (const ramp of offRampAddresses) {
    const exchange = ramp.name.split('_')[0];
    
    await prisma.exchangeWallet.upsert({
      where: { address: ramp.address },
      update: { 
        exchange,
        walletType: 'withdrawal',
        lastVerified: new Date()
      },
      create: {
        address: ramp.address,
        exchange,
        walletType: 'withdrawal'
      }
    });
  }
  
  console.log(`Seeded ${offRampAddresses.length} off-ramp addresses`);
}

seedOffRamps()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
