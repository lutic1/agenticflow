#!/usr/bin/env node

/**
 * Compare Performance Baseline Script
 * Compares current performance metrics against baseline
 */

const fs = require('fs');
const path = require('path');

function loadBaseline(baselineName) {
  const baselinePath = path.join(__dirname, `../benchmarks/${baselineName}-baseline.json`);

  if (!fs.existsSync(baselinePath)) {
    console.warn(`⚠️  Baseline file not found: ${baselinePath}`);
    console.warn('Creating mock baseline for demonstration...');
    return {
      avgResponseTime: 100,
      p95ResponseTime: 150,
      p99ResponseTime: 200,
      throughput: 1000,
      errorRate: 0.001
    };
  }

  try {
    const content = fs.readFileSync(baselinePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading baseline:', error.message);
    process.exit(1);
  }
}

function loadCurrentMetrics() {
  const metricsPath = path.join(__dirname, '../benchmarks/current-metrics.json');

  if (!fs.existsSync(metricsPath)) {
    console.warn('⚠️  Current metrics file not found, using mock data...');
    return {
      avgResponseTime: 105,
      p95ResponseTime: 155,
      p99ResponseTime: 210,
      throughput: 950,
      errorRate: 0.002
    };
  }

  try {
    const content = fs.readFileSync(metricsPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading current metrics:', error.message);
    process.exit(1);
  }
}

function compareMetrics(baseline, current, threshold) {
  const results = {
    passed: true,
    degradations: [],
    improvements: [],
    summary: {}
  };

  const metrics = [
    { name: 'avgResponseTime', lowerIsBetter: true, unit: 'ms' },
    { name: 'p95ResponseTime', lowerIsBetter: true, unit: 'ms' },
    { name: 'p99ResponseTime', lowerIsBetter: true, unit: 'ms' },
    { name: 'throughput', lowerIsBetter: false, unit: 'req/s' },
    { name: 'errorRate', lowerIsBetter: true, unit: '%' }
  ];

  metrics.forEach(metric => {
    const baselineValue = baseline[metric.name] || 0;
    const currentValue = current[metric.name] || 0;

    const percentChange = baselineValue === 0
      ? 0
      : ((currentValue - baselineValue) / baselineValue) * 100;

    const isDegraded = metric.lowerIsBetter
      ? percentChange > threshold
      : percentChange < -threshold;

    const isImproved = metric.lowerIsBetter
      ? percentChange < -threshold
      : percentChange > threshold;

    results.summary[metric.name] = {
      baseline: baselineValue,
      current: currentValue,
      change: percentChange.toFixed(2),
      unit: metric.unit,
      status: isDegraded ? 'DEGRADED' : isImproved ? 'IMPROVED' : 'STABLE'
    };

    if (isDegraded) {
      results.passed = false;
      results.degradations.push({
        metric: metric.name,
        change: percentChange.toFixed(2),
        baseline: baselineValue,
        current: currentValue
      });
    } else if (isImproved) {
      results.improvements.push({
        metric: metric.name,
        change: Math.abs(percentChange).toFixed(2),
        baseline: baselineValue,
        current: currentValue
      });
    }
  });

  return results;
}

function printResults(results, baselineName, threshold) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Performance Comparison: ${baselineName.toUpperCase()}`);
  console.log(`Threshold: ${threshold}%`);
  console.log(`${'='.repeat(60)}\n`);

  console.log('Metric Summary:');
  console.log('-'.repeat(60));
  Object.keys(results.summary).forEach(metric => {
    const data = results.summary[metric];
    const statusEmoji = data.status === 'DEGRADED' ? '❌' :
                       data.status === 'IMPROVED' ? '✅' :
                       '➡️';
    console.log(`${statusEmoji} ${metric}:`);
    console.log(`   Baseline: ${data.baseline}${data.unit}`);
    console.log(`   Current:  ${data.current}${data.unit}`);
    console.log(`   Change:   ${data.change > 0 ? '+' : ''}${data.change}%`);
    console.log('');
  });

  if (results.degradations.length > 0) {
    console.log('\n❌ Performance Degradations Detected:');
    console.log('-'.repeat(60));
    results.degradations.forEach(deg => {
      console.log(`  - ${deg.metric}: ${deg.baseline} → ${deg.current} (${deg.change > 0 ? '+' : ''}${deg.change}%)`);
    });
  }

  if (results.improvements.length > 0) {
    console.log('\n✅ Performance Improvements:');
    console.log('-'.repeat(60));
    results.improvements.forEach(imp => {
      console.log(`  - ${imp.metric}: ${imp.baseline} → ${imp.current} (-${imp.change}%)`);
    });
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Overall Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`${'='.repeat(60)}\n`);

  // Save results
  const resultsPath = path.join(__dirname, '../benchmarks/degradation-report.json');
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`✓ Results saved to: ${resultsPath}`);
}

// Main
const args = process.argv.slice(2);
const baselineIndex = args.indexOf('--baseline');
const thresholdIndex = args.indexOf('--threshold');

if (baselineIndex === -1 || !args[baselineIndex + 1]) {
  console.error('Usage: node compare-performance-baseline.js --baseline <p0|p1> --threshold <percentage>');
  process.exit(1);
}

const baselineName = args[baselineIndex + 1];
const threshold = thresholdIndex !== -1 && args[thresholdIndex + 1]
  ? parseFloat(args[thresholdIndex + 1])
  : 5; // Default 5%

console.log(`Loading ${baselineName} baseline...`);
const baseline = loadBaseline(baselineName);

console.log('Loading current metrics...');
const current = loadCurrentMetrics();

console.log('Comparing performance...');
const results = compareMetrics(baseline, current, threshold);

printResults(results, baselineName, threshold);

process.exit(results.passed ? 0 : 1);
