#!/usr/bin/env node

/**
 * Configure P2 Feature Flags Script
 * Sets up feature flags for P2 testing scenarios
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../config/feature-flags-p2.json');

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
  const individualFeatures = scenarioConfig.individualFeatures || [];

  // Disable all features first
  Object.keys(config.p2Features).forEach(batch => {
    Object.keys(config.p2Features[batch]).forEach(feature => {
      config.p2Features[batch][feature] = false;
    });
  });

  // Enable features for selected batches
  enabledBatches.forEach(batch => {
    if (config.p2Features[batch]) {
      Object.keys(config.p2Features[batch]).forEach(feature => {
        config.p2Features[batch][feature] = true;
      });
    }
  });

  // Enable individual features
  individualFeatures.forEach(featureName => {
    Object.keys(config.p2Features).forEach(batch => {
      if (config.p2Features[batch][featureName] !== undefined) {
        config.p2Features[batch][featureName] = true;
      }
    });
  });

  // Write updated config
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

  console.log(`✓ Applied scenario: ${scenario}`);
  console.log(`✓ Description: ${scenarioConfig.description}`);
  console.log(`✓ Enabled batches: ${enabledBatches.join(', ') || 'none'}`);
  if (individualFeatures.length > 0) {
    console.log(`✓ Individual features: ${individualFeatures.join(', ')}`);
  }

  return config;
}

// Main
const args = process.argv.slice(2);
const scenarioIndex = args.indexOf('--scenario');

if (scenarioIndex === -1 || !args[scenarioIndex + 1]) {
  console.error('Usage: node configure-feature-flags-p2.js --scenario <scenario-name>');
  console.log('\nAvailable scenarios:');
  const config = loadConfig();
  Object.keys(config.scenarios).forEach(s => {
    console.log(`  - ${s}: ${config.scenarios[s].description}`);
  });
  process.exit(1);
}

const scenario = args[scenarioIndex + 1];
applyScenario(scenario);

console.log('\n✓ P2 Feature flags configured successfully');
