/**
 * CLI Tool
 * 
 * Command-line interface for Pasha Tracker.
 */

import { Command } from 'commander';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();
const API_URL = process.env.PASHA_API_URL || 'http://localhost:3000/api/v1';

program
  .name('pasha')
  .description('Pasha Tracker CLI')
  .version('1.0.0');

// Trace command
program
  .command('trace <wallet>')
  .description('Trace wallet transactions')
  .option('-d, --depth <number>', 'Maximum trace depth', '10')
  .option('--no-exchanges', 'Skip exchange identification')
  .action(async (wallet, options) => {
    const spinner = ora('Tracing wallet...').start();
    
    try {
      const response = await axios.post(`${API_URL}/trace/origin`, {
        walletAddress: wallet,
        maxDepth: parseInt(options.depth),
        includeExchanges: options.exchanges
      });
      
      spinner.succeed('Trace complete');
      console.log(chalk.green('\nResults:'));
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      spinner.fail('Trace failed');
      console.error(chalk.red(error.response?.data?.error || error.message));
    }
  });

// Verify command
program
  .command('verify <address>')
  .description('Verify if address belongs to an exchange')
  .action(async (address) => {
    const spinner = ora('Verifying address...').start();
    
    try {
      const response = await axios.get(`${API_URL}/exchanges/verify/${address}`);
      
      spinner.succeed('Verification complete');
      
      if (response.data.isExchange) {
        console.log(chalk.green(`\n✓ Exchange: ${response.data.exchange}`));
        console.log(chalk.gray(`  Type: ${response.data.walletType}`));
        console.log(chalk.gray(`  Confidence: ${response.data.confidence}`));
      } else {
        console.log(chalk.yellow('\n✗ Not a known exchange address'));
      }
    } catch (error) {
      spinner.fail('Verification failed');
      console.error(chalk.red(error.response?.data?.error || error.message));
    }
  });

// Bundles command
program
  .command('bundles <token>')
  .description('Detect wallet bundles for a token')
  .option('-t, --time <window>', 'Time window (1h, 24h, 7d)', '24h')
  .option('-w, --wallets <number>', 'Minimum wallets', '3')
  .action(async (token, options) => {
    const spinner = ora('Detecting bundles...').start();
    
    try {
      const response = await axios.post(`${API_URL}/bundles/detect`, {
        tokenAddress: token,
        timeWindow: options.time,
        minWallets: parseInt(options.wallets)
      });
      
      spinner.succeed(`Found ${response.data.totalBundles} bundles`);
      
      response.data.bundles.forEach((bundle: any, i: number) => {
        console.log(chalk.blue(`\nBundle ${i + 1}:`));
        console.log(chalk.gray(`  Confidence: ${bundle.confidence}`));
        console.log(chalk.gray(`  Wallets: ${bundle.wallets.length}`));
        console.log(chalk.gray(`  Volume: ${bundle.totalVolume}`));
      });
    } catch (error) {
      spinner.fail('Detection failed');
      console.error(chalk.red(error.response?.data?.error || error.message));
    }
  });

// Health command
program
  .command('health')
  .description('Check API health')
  .action(async () => {
    try {
      const response = await axios.get(`${API_URL.replace('/v1', '')}/health`);
      
      if (response.data.status === 'healthy') {
        console.log(chalk.green('✓ API is healthy'));
        console.log(chalk.gray(`  Version: ${response.data.version}`));
        console.log(chalk.gray(`  Time: ${response.data.timestamp}`));
      }
    } catch (error) {
      console.error(chalk.red('✗ API is unhealthy'));
      process.exit(1);
    }
  });

program.parse();
