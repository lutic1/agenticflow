/**
 * Example: Business Presentation Generator
 * Generates professional corporate slide decks
 */

interface BusinessSlideConfig {
  companyName: string;
  quarter: string;
  year: number;
  presenter: string;
  includeFinancials: boolean;
  includeMetrics: boolean;
  theme?: 'corporate' | 'modern' | 'minimal';
}

class BusinessPresentationGenerator {
  private config: BusinessSlideConfig;

  constructor(config: BusinessSlideConfig) {
    this.config = config;
  }

  async generate(): Promise<string> {
    const slides: string[] = [];

    // Title Slide
    slides.push(this.generateTitleSlide());

    // Executive Summary
    slides.push(this.generateExecutiveSummary());

    // Key Highlights
    slides.push(this.generateKeyHighlights());

    // Financial Performance (if enabled)
    if (this.config.includeFinancials) {
      slides.push(this.generateFinancialPerformance());
      slides.push(this.generateRevenueBreakdown());
    }

    // Business Metrics (if enabled)
    if (this.config.includeMetrics) {
      slides.push(this.generateKeyMetrics());
      slides.push(this.generateCustomerGrowth());
    }

    // Strategic Initiatives
    slides.push(this.generateStrategicInitiatives());

    // Market Analysis
    slides.push(this.generateMarketAnalysis());

    // Competitive Landscape
    slides.push(this.generateCompetitiveLandscape());

    // Next Quarter Outlook
    slides.push(this.generateOutlook());

    // Conclusion
    slides.push(this.generateConclusion());

    return this.wrapInHTML(slides);
  }

  private generateTitleSlide(): string {
    return `
<div class="slide slide-title" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
  <h1 style="font-size: 3.5em; margin-bottom: 0.5em;">${this.config.companyName}</h1>
  <h2 style="font-size: 2em; opacity: 0.9;">${this.config.quarter} ${this.config.year} Business Review</h2>
  <p style="margin-top: 3em; font-size: 1.2em; opacity: 0.8;">${this.config.presenter}</p>
  <p style="font-size: 1em; opacity: 0.7;">${new Date().toLocaleDateString()}</p>
</div>`;
  }

  private generateExecutiveSummary(): string {
    return `
<div class="slide">
  <h1>Executive Summary</h1>
  <div class="content">
    <div class="summary-box" style="background: #f8f9fa; padding: 2rem; border-radius: 10px; margin: 1rem 0;">
      <h2 style="color: #667eea;">Strong Quarter Performance</h2>
      <ul style="font-size: 1.2em; line-height: 1.8;">
        <li>Revenue growth exceeded expectations by 15%</li>
        <li>Customer acquisition up 28% YoY</li>
        <li>Successfully launched 3 major product features</li>
        <li>Expanded into 2 new market segments</li>
        <li>Team grew by 25 talented professionals</li>
      </ul>
    </div>
  </div>
</div>`;
  }

  private generateKeyHighlights(): string {
    return `
<div class="slide">
  <h1>Key Highlights</h1>
  <div class="highlights-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-top: 2rem;">
    <div class="highlight-card" style="background: #e8f4f8; padding: 2rem; border-radius: 10px; text-align: center;">
      <h2 style="font-size: 3em; color: #667eea; margin-bottom: 0.5rem;">$12.5M</h2>
      <p style="font-size: 1.2em; color: #555;">Quarterly Revenue</p>
      <p style="color: #28a745; font-weight: bold;">↑ 23% QoQ</p>
    </div>
    <div class="highlight-card" style="background: #f8e8f4; padding: 2rem; border-radius: 10px; text-align: center;">
      <h2 style="font-size: 3em; color: #764ba2; margin-bottom: 0.5rem;">1,247</h2>
      <p style="font-size: 1.2em; color: #555;">New Customers</p>
      <p style="color: #28a745; font-weight: bold;">↑ 28% YoY</p>
    </div>
    <div class="highlight-card" style="background: #e8f8f0; padding: 2rem; border-radius: 10px; text-align: center;">
      <h2 style="font-size: 3em; color: #28a745; margin-bottom: 0.5rem;">94%</h2>
      <p style="font-size: 1.2em; color: #555;">Customer Satisfaction</p>
      <p style="color: #28a745; font-weight: bold;">↑ 3% QoQ</p>
    </div>
    <div class="highlight-card" style="background: #fff8e8; padding: 2rem; border-radius: 10px; text-align: center;">
      <h2 style="font-size: 3em; color: #ffa500; margin-bottom: 0.5rem;">3</h2>
      <p style="font-size: 1.2em; color: #555;">Product Launches</p>
      <p style="color: #667eea; font-weight: bold;">On Schedule</p>
    </div>
  </div>
</div>`;
  }

  private generateFinancialPerformance(): string {
    return `
<div class="slide">
  <h1>Financial Performance</h1>
  <div class="content">
    <h2 style="margin-top: 2rem;">Revenue Trend</h2>
    <div style="background: #f8f9fa; padding: 2rem; border-radius: 10px; margin: 1rem 0;">
      <div style="display: flex; justify-content: space-around; align-items: flex-end; height: 300px; border-bottom: 2px solid #ddd;">
        <div style="width: 15%; background: linear-gradient(to top, #667eea, #764ba2); height: 60%; display: flex; align-items: flex-end; justify-content: center; color: white; font-weight: bold;">Q1<br/>$9.2M</div>
        <div style="width: 15%; background: linear-gradient(to top, #667eea, #764ba2); height: 75%; display: flex; align-items: flex-end; justify-content: center; color: white; font-weight: bold;">Q2<br/>$10.1M</div>
        <div style="width: 15%; background: linear-gradient(to top, #667eea, #764ba2); height: 85%; display: flex; align-items: flex-end; justify-content: center; color: white; font-weight: bold;">Q3<br/>$11.3M</div>
        <div style="width: 15%; background: linear-gradient(to top, #667eea, #764ba2); height: 100%; display: flex; align-items: flex-end; justify-content: center; color: white; font-weight: bold;">Q4<br/>$12.5M</div>
      </div>
    </div>
  </div>
</div>`;
  }

  private generateRevenueBreakdown(): string {
    return `
<div class="slide">
  <h1>Revenue Breakdown</h1>
  <div class="content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
    <div>
      <h2>By Product</h2>
      <ul style="font-size: 1.2em; line-height: 2;">
        <li>Enterprise Platform: 52% ($6.5M)</li>
        <li>Professional Services: 28% ($3.5M)</li>
        <li>Cloud Solutions: 15% ($1.9M)</li>
        <li>Other: 5% ($0.6M)</li>
      </ul>
    </div>
    <div>
      <h2>By Region</h2>
      <ul style="font-size: 1.2em; line-height: 2;">
        <li>North America: 58% ($7.3M)</li>
        <li>Europe: 25% ($3.1M)</li>
        <li>Asia Pacific: 12% ($1.5M)</li>
        <li>Other: 5% ($0.6M)</li>
      </ul>
    </div>
  </div>
</div>`;
  }

  private generateKeyMetrics(): string {
    return `
<div class="slide">
  <h1>Key Business Metrics</h1>
  <div class="metrics-table" style="margin-top: 2rem;">
    <table style="width: 100%; border-collapse: collapse; font-size: 1.1em;">
      <thead style="background: #667eea; color: white;">
        <tr>
          <th style="padding: 1rem; text-align: left;">Metric</th>
          <th style="padding: 1rem; text-align: right;">Current</th>
          <th style="padding: 1rem; text-align: right;">Previous</th>
          <th style="padding: 1rem; text-align: right;">Change</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f8f9fa;">
          <td style="padding: 1rem;">Monthly Recurring Revenue</td>
          <td style="padding: 1rem; text-align: right; font-weight: bold;">$4.2M</td>
          <td style="padding: 1rem; text-align: right;">$3.8M</td>
          <td style="padding: 1rem; text-align: right; color: #28a745; font-weight: bold;">+10.5%</td>
        </tr>
        <tr>
          <td style="padding: 1rem;">Customer Lifetime Value</td>
          <td style="padding: 1rem; text-align: right; font-weight: bold;">$58K</td>
          <td style="padding: 1rem; text-align: right;">$52K</td>
          <td style="padding: 1rem; text-align: right; color: #28a745; font-weight: bold;">+11.5%</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 1rem;">Customer Acquisition Cost</td>
          <td style="padding: 1rem; text-align: right; font-weight: bold;">$12K</td>
          <td style="padding: 1rem; text-align: right;">$14K</td>
          <td style="padding: 1rem; text-align: right; color: #28a745; font-weight: bold;">-14.3%</td>
        </tr>
        <tr>
          <td style="padding: 1rem;">Churn Rate</td>
          <td style="padding: 1rem; text-align: right; font-weight: bold;">2.1%</td>
          <td style="padding: 1rem; text-align: right;">2.8%</td>
          <td style="padding: 1rem; text-align: right; color: #28a745; font-weight: bold;">-25%</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;
  }

  private generateCustomerGrowth(): string {
    return `
<div class="slide">
  <h1>Customer Growth</h1>
  <div class="content">
    <div class="growth-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin: 2rem 0;">
      <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 10px;">
        <h2 style="font-size: 2.5em; color: #667eea;">8,432</h2>
        <p style="font-size: 1.2em; color: #555;">Total Customers</p>
      </div>
      <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 10px;">
        <h2 style="font-size: 2.5em; color: #764ba2;">1,247</h2>
        <p style="font-size: 1.2em; color: #555;">New This Quarter</p>
      </div>
      <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 10px;">
        <h2 style="font-size: 2.5em; color: #28a745;">98.9%</h2>
        <p style="font-size: 1.2em; color: #555;">Retention Rate</p>
      </div>
    </div>
    <h2 style="margin-top: 2rem;">Customer Segments</h2>
    <ul style="font-size: 1.2em; line-height: 2; margin-top: 1rem;">
      <li>Enterprise (1000+ employees): 23% - $7.2M ARR</li>
      <li>Mid-Market (100-999 employees): 42% - $5.8M ARR</li>
      <li>Small Business (<100 employees): 35% - $2.3M ARR</li>
    </ul>
  </div>
</div>`;
  }

  private generateStrategicInitiatives(): string {
    return `
<div class="slide">
  <h1>Strategic Initiatives</h1>
  <div class="content">
    <div class="initiatives" style="margin-top: 2rem;">
      <div class="initiative" style="margin-bottom: 2rem; padding: 1.5rem; background: #f8f9fa; border-left: 5px solid #667eea; border-radius: 5px;">
        <h2 style="color: #667eea;">1. Product Innovation</h2>
        <p style="font-size: 1.1em; margin: 0.5rem 0;">Launch AI-powered analytics dashboard by Q2</p>
        <p style="color: #28a745; font-weight: bold;">Status: On Track | 65% Complete</p>
      </div>
      <div class="initiative" style="margin-bottom: 2rem; padding: 1.5rem; background: #f8f9fa; border-left: 5px solid #764ba2; border-radius: 5px;">
        <h2 style="color: #764ba2;">2. Market Expansion</h2>
        <p style="font-size: 1.1em; margin: 0.5rem 0;">Enter 3 new geographic markets in H1</p>
        <p style="color: #28a745; font-weight: bold;">Status: Ahead of Schedule | 2 Markets Live</p>
      </div>
      <div class="initiative" style="margin-bottom: 2rem; padding: 1.5rem; background: #f8f9fa; border-left: 5px solid #28a745; border-radius: 5px;">
        <h2 style="color: #28a745;">3. Strategic Partnerships</h2>
        <p style="font-size: 1.1em; margin: 0.5rem 0;">Establish 5 key technology partnerships</p>
        <p style="color: #ffa500; font-weight: bold;">Status: In Progress | 3 Signed, 2 Negotiating</p>
      </div>
    </div>
  </div>
</div>`;
  }

  private generateMarketAnalysis(): string {
    return `
<div class="slide">
  <h1>Market Analysis</h1>
  <div class="content" style="margin-top: 2rem;">
    <h2>Market Position</h2>
    <div style="background: #f8f9fa; padding: 2rem; border-radius: 10px; margin: 1rem 0;">
      <ul style="font-size: 1.2em; line-height: 2;">
        <li>Total Addressable Market: $45B (growing 18% annually)</li>
        <li>Our Market Share: 2.8% (up from 2.1% last year)</li>
        <li>Ranked #3 in our category by Gartner</li>
        <li>Strong presence in North America and expanding globally</li>
      </ul>
    </div>
    <h2 style="margin-top: 2rem;">Market Trends</h2>
    <div style="background: #f8f9fa; padding: 2rem; border-radius: 10px; margin: 1rem 0;">
      <ul style="font-size: 1.2em; line-height: 2;">
        <li>Increased demand for AI/ML-powered solutions</li>
        <li>Shift towards cloud-native architectures</li>
        <li>Focus on data privacy and security</li>
        <li>Integration with existing enterprise systems</li>
      </ul>
    </div>
  </div>
</div>`;
  }

  private generateCompetitiveLandscape(): string {
    return `
<div class="slide">
  <h1>Competitive Landscape</h1>
  <div class="content" style="margin-top: 2rem;">
    <h2>Our Competitive Advantages</h2>
    <div class="advantages-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin: 1rem 0;">
      <div style="background: #e8f4f8; padding: 1.5rem; border-radius: 10px;">
        <h3 style="color: #667eea;">🚀 Technology Leadership</h3>
        <p>Advanced AI capabilities and fastest time-to-value</p>
      </div>
      <div style="background: #f8e8f4; padding: 1.5rem; border-radius: 10px;">
        <h3 style="color: #764ba2;">💰 Price-Performance</h3>
        <p>30% better ROI than nearest competitor</p>
      </div>
      <div style="background: #e8f8f0; padding: 1.5rem; border-radius: 10px;">
        <h3 style="color: #28a745;">🤝 Customer Success</h3>
        <p>94% satisfaction score, industry-leading support</p>
      </div>
      <div style="background: #fff8e8; padding: 1.5rem; border-radius: 10px;">
        <h3 style="color: #ffa500;">🔧 Integration Ease</h3>
        <p>Seamless integration with 50+ platforms</p>
      </div>
    </div>
  </div>
</div>`;
  }

  private generateOutlook(): string {
    return `
<div class="slide">
  <h1>Next Quarter Outlook</h1>
  <div class="content" style="margin-top: 2rem;">
    <h2>Key Objectives</h2>
    <div style="background: #f8f9fa; padding: 2rem; border-radius: 10px; margin: 1rem 0;">
      <ul style="font-size: 1.2em; line-height: 2;">
        <li>Achieve $14M in revenue (12% growth)</li>
        <li>Add 1,500+ new customers</li>
        <li>Launch AI-powered analytics platform</li>
        <li>Expand sales team by 15 members</li>
        <li>Enter Australian and Japanese markets</li>
      </ul>
    </div>
    <h2 style="margin-top: 2rem;">Investment Priorities</h2>
    <div style="background: #f8f9fa; padding: 2rem; border-radius: 10px; margin: 1rem 0;">
      <ul style="font-size: 1.2em; line-height: 2;">
        <li>Product Development: $2.5M</li>
        <li>Sales & Marketing: $1.8M</li>
        <li>Customer Success: $0.8M</li>
        <li>Infrastructure: $0.5M</li>
      </ul>
    </div>
  </div>
</div>`;
  }

  private generateConclusion(): string {
    return `
<div class="slide slide-conclusion" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
  <h1 style="font-size: 3em;">Thank You</h1>
  <div style="margin: 3rem 0;">
    <p style="font-size: 1.5em; opacity: 0.9;">Strong Quarter. Bright Future.</p>
  </div>
  <div style="margin-top: 4rem; opacity: 0.8;">
    <p style="font-size: 1.2em;">Questions?</p>
    <p style="font-size: 1em; margin-top: 1rem;">${this.config.presenter}</p>
    <p style="font-size: 0.9em;">${this.config.companyName}</p>
  </div>
</div>`;
  }

  private wrapInHTML(slides: string[]): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.config.companyName} - ${this.config.quarter} ${this.config.year} Review</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', 'Segoe UI', sans-serif; }
    .slide {
      min-height: 100vh;
      padding: 4rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      page-break-after: always;
    }
    .slide h1 { font-size: 2.5em; margin-bottom: 1rem; color: #1a1a1a; }
    .slide h2 { font-size: 1.8em; margin: 1rem 0; color: #333; }
    .slide h3 { font-size: 1.3em; margin: 0.5rem 0; }
    .slide p, .slide li { font-size: 1.1em; line-height: 1.6; color: #555; }
    .slide ul { margin-left: 2rem; }
    @media print { .slide { page-break-after: always; } }
  </style>
</head>
<body>
${slides.join('\n')}
</body>
</html>`;
  }
}

// Example usage
async function main() {
  const generator = new BusinessPresentationGenerator({
    companyName: 'TechCorp Solutions',
    quarter: 'Q4',
    year: 2024,
    presenter: 'Jane Smith, CEO',
    includeFinancials: true,
    includeMetrics: true,
    theme: 'corporate'
  });

  const html = await generator.generate();
  console.log('✅ Business presentation generated successfully!');
  console.log(`📊 Total length: ${html.length} characters`);
  console.log(`📄 Ready to save to file or export to PDF`);

  return html;
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { BusinessPresentationGenerator, BusinessSlideConfig };
