#!/usr/bin/env node

/**
 * Configure P1 Feature Flags Script
 * Sets up feature flags for P1 testing scenarios
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../config/feature-flags.json');

function loadConfig() {
  try {
    const content = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading config:', error.message);
    process.exit(1);
  }
}

function applyScenario(scenario) {
  const config = loadConfig();

  if (!config.scenarios[scenario]) {
    console.error(`Unknown scenario: ${scenario}`);
    console.log('Available scenarios:');
    Object.keys(config.scenarios).forEach(s => {
      console.log(`  - ${s}: ${config.scenarios[s].description}`);
    });
    process.exit(1);
  }

  const scenarioConfig = config.scenarios[scenario];
  const enabledBatches = scenarioConfig.batches || [];

  // Disable all features first
  Object.keys(config.p1Features).forEach(batch => {
    Object.keys(config.p1Features[batch]).forEach(feature => {
      config.p1Features[batch][feature] = false;
    });
  });

  // Enable features for selected batches
  enabledBatches.forEach(batch => {
    if (config.p1Features[batch]) {
      Object.keys(config.p1Features[batch]).forEach(feature => {
        config.p1Features[batch][feature] = true;
      });
    }
  });

  // Write updated config
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

  console.log(`✓ Applied scenario: ${scenario}`);
  console.log(`✓ Description: ${scenarioConfig.description}`);
  console.log(`✓ Enabled batches: ${enabledBatches.join(', ') || 'none'}`);

  return config;
}

// Main
const args = process.argv.slice(2);
const scenarioIndex = args.indexOf('--scenario');

if (scenarioIndex === -1 || !args[scenarioIndex + 1]) {
  console.error('Usage: node configure-feature-flags.js --scenario <scenario-name>');
  console.log('\nAvailable scenarios:');
  const config = loadConfig();
  Object.keys(config.scenarios).forEach(s => {
    console.log(`  - ${s}: ${config.scenarios[s].description}`);
  });
  process.exit(1);
}

const scenario = args[scenarioIndex + 1];
applyScenario(scenario);

console.log('\n✓ Feature flags configured successfully');
