/**
 * Example: Startup Pitch Deck Generator
 * Generates investor-ready pitch presentations
 */

interface PitchDeckConfig {
  companyName: string;
  tagline: string;
  founders: string[];
  problem: string;
  solution: string;
  marketSize: string;
  businessModel: string;
  askAmount: string;
  use: string;
}

class StartupPitchGenerator {
  private config: PitchDeckConfig;

  constructor(config: PitchDeckConfig) {
    this.config = config;
  }

  async generate(): Promise<string> {
    const slides: string[] = [];

    slides.push(this.generateCoverSlide());
    slides.push(this.generateProblemSlide());
    slides.push(this.generateSolutionSlide());
    slides.push(this.generateProductSlide());
    slides.push(this.generateMarketSlide());
    slides.push(this.generateBusinessModelSlide());
    slides.push(this.generateTractionSlide());
    slides.push(this.generateCompetitionSlide());
    slides.push(this.generateTeamSlide());
    slides.push(this.generateFinancialsSlide());
    slides.push(this.generateAskSlide());
    slides.push(this.generateClosingSlide());

    return this.wrapInHTML(slides);
  }

  private generateCoverSlide(): string {
    return `
<div class="slide" style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; text-align: center;">
  <h1 style="font-size: 4em; margin-bottom: 0.5em;">${this.config.companyName}</h1>
  <p style="font-size: 2em; opacity: 0.9; margin-bottom: 3em;">${this.config.tagline}</p>
  <p style="font-size: 1.3em; opacity: 0.8;">${this.config.founders.join(' · ')}</p>
</div>`;
  }

  private generateProblemSlide(): string {
    return `
<div class="slide">
  <h1>The Problem</h1>
  <div style="margin-top: 3rem;">
    <div style="background: #fff3cd; border-left: 5px solid #ffc107; padding: 2rem; border-radius: 10px;">
      <p style="font-size: 1.8em; line-height: 1.6; color: #333;">${this.config.problem}</p>
    </div>
    <div style="margin-top: 3rem;">
      <h2>Why This Matters</h2>
      <ul style="font-size: 1.3em; line-height: 2; margin-top: 1rem;">
        <li>Affects millions of people daily</li>
        <li>Costs businesses billions annually</li>
        <li>No effective solution exists today</li>
      </ul>
    </div>
  </div>
</div>`;
  }

  private generateSolutionSlide(): string {
    return `
<div class="slide">
  <h1>Our Solution</h1>
  <div style="margin-top: 3rem;">
    <div style="background: #d1ecf1; border-left: 5px solid #17a2b8; padding: 2rem; border-radius: 10px;">
      <p style="font-size: 1.8em; line-height: 1.6; color: #333;">${this.config.solution}</p>
    </div>
    <div style="margin-top: 3rem;">
      <h2>Key Benefits</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 1.5rem;">
        <div style="text-align: center; padding: 1.5rem; background: #f8f9fa; border-radius: 10px;">
          <h3 style="color: #6a11cb; font-size: 2em;">10x</h3>
          <p style="font-size: 1.1em;">Faster</p>
        </div>
        <div style="text-align: center; padding: 1.5rem; background: #f8f9fa; border-radius: 10px;">
          <h3 style="color: #2575fc; font-size: 2em;">50%</h3>
          <p style="font-size: 1.1em;">Lower Cost</p>
        </div>
        <div style="text-align: center; padding: 1.5rem; background: #f8f9fa; border-radius: 10px;">
          <h3 style="color: #28a745; font-size: 2em;">24/7</h3>
          <p style="font-size: 1.1em;">Available</p>
        </div>
      </div>
    </div>
  </div>
</div>`;
  }

  private generateProductSlide(): string {
    return `
<div class="slide">
  <h1>Product Demo</h1>
  <div style="margin-top: 2rem;">
    <div style="background: #f8f9fa; padding: 3rem; border-radius: 15px; text-align: center;">
      <div style="background: #fff; padding: 2rem; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <p style="font-size: 3em; color: #6a11cb;">🚀</p>
        <p style="font-size: 1.5em; margin-top: 1rem; color: #555;">Intuitive Interface</p>
        <p style="font-size: 1.5em; color: #555;">Powerful Features</p>
        <p style="font-size: 1.5em; color: #555;">Seamless Integration</p>
      </div>
    </div>
  </div>
</div>`;
  }

  private generateMarketSlide(): string {
    return `
<div class="slide">
  <h1>Market Opportunity</h1>
  <div style="margin-top: 2rem;">
    <h2>Total Addressable Market: ${this.config.marketSize}</h2>
    <div style="margin-top: 2rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
      <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 10px;">
        <h3 style="font-size: 2.5em; color: #6a11cb; margin-bottom: 1rem;">$150B</h3>
        <p style="font-size: 1.2em; color: #555;">Total Market</p>
        <p style="font-size: 0.9em; color: #777; margin-top: 0.5rem;">TAM</p>
      </div>
      <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 10px;">
        <h3 style="font-size: 2.5em; color: #2575fc; margin-bottom: 1rem;">$45B</h3>
        <p style="font-size: 1.2em; color: #555;">Serviceable Market</p>
        <p style="font-size: 0.9em; color: #777; margin-top: 0.5rem;">SAM</p>
      </div>
      <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 10px;">
        <h3 style="font-size: 2.5em; color: #28a745; margin-bottom: 1rem;">$8B</h3>
        <p style="font-size: 1.2em; color: #555;">Obtainable Market</p>
        <p style="font-size: 0.9em; color: #777; margin-top: 0.5rem;">SOM</p>
      </div>
    </div>
    <div style="margin-top: 2rem; background: #e8f4f8; padding: 2rem; border-radius: 10px;">
      <p style="font-size: 1.2em; line-height: 1.8;">
        <strong>Market Growing at 25% CAGR</strong><br/>
        Expected to reach $280B by 2028
      </p>
    </div>
  </div>
</div>`;
  }

  private generateBusinessModelSlide(): string {
    return `
<div class="slide">
  <h1>Business Model</h1>
  <div style="margin-top: 2rem;">
    <div style="background: #f8f9fa; padding: 2rem; border-radius: 10px;">
      <h2 style="color: #6a11cb; margin-bottom: 1rem;">${this.config.businessModel}</h2>
      <div style="margin-top: 2rem;">
        <h3>Revenue Streams</h3>
        <ul style="font-size: 1.2em; line-height: 2; margin-top: 1rem;">
          <li>SaaS Subscriptions: $99-$999/month</li>
          <li>Professional Services: $5K-$50K per project</li>
          <li>Enterprise Licenses: $100K+ annually</li>
          <li>API Usage: Pay-as-you-go model</li>
        </ul>
      </div>
      <div style="margin-top: 2rem;">
        <h3>Unit Economics</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 1rem;">
          <div>
            <p style="font-size: 1.1em;"><strong>LTV:</strong> $58,000</p>
            <p style="font-size: 1.1em;"><strong>CAC:</strong> $12,000</p>
          </div>
          <div>
            <p style="font-size: 1.1em;"><strong>LTV:CAC Ratio:</strong> 4.8:1</p>
            <p style="font-size: 1.1em;"><strong>Payback:</strong> 8 months</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
  }

  private generateTractionSlide(): string {
    return `
<div class="slide">
  <h1>Traction & Milestones</h1>
  <div style="margin-top: 2rem;">
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
      <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
        <h2 style="font-size: 3em; margin-bottom: 0.5rem;">5,247</h2>
        <p style="font-size: 1.3em; opacity: 0.9;">Active Users</p>
      </div>
      <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 10px;">
        <h2 style="font-size: 3em; margin-bottom: 0.5rem;">$847K</h2>
        <p style="font-size: 1.3em; opacity: 0.9;">ARR</p>
      </div>
      <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 10px;">
        <h2 style="font-size: 3em; margin-bottom: 0.5rem;">15%</h2>
        <p style="font-size: 1.3em; opacity: 0.9;">MoM Growth</p>
      </div>
      <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; border-radius: 10px;">
        <h2 style="font-size: 3em; margin-bottom: 0.5rem;">92%</h2>
        <p style="font-size: 1.3em; opacity: 0.9;">Retention Rate</p>
      </div>
    </div>
  </div>
</div>`;
  }

  private generateCompetitionSlide(): string {
    return `
<div class="slide">
  <h1>Competitive Landscape</h1>
  <div style="margin-top: 2rem;">
    <table style="width: 100%; border-collapse: collapse; font-size: 1.1em;">
      <thead style="background: #6a11cb; color: white;">
        <tr>
          <th style="padding: 1rem; text-align: left;">Feature</th>
          <th style="padding: 1rem; text-align: center;">Us</th>
          <th style="padding: 1rem; text-align: center;">Competitor A</th>
          <th style="padding: 1rem; text-align: center;">Competitor B</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f8f9fa;">
          <td style="padding: 1rem;">AI-Powered</td>
          <td style="padding: 1rem; text-align: center;">✅</td>
          <td style="padding: 1rem; text-align: center;">❌</td>
          <td style="padding: 1rem; text-align: center;">❌</td>
        </tr>
        <tr>
          <td style="padding: 1rem;">Real-time</td>
          <td style="padding: 1rem; text-align: center;">✅</td>
          <td style="padding: 1rem; text-align: center;">✅</td>
          <td style="padding: 1rem; text-align: center;">❌</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 1rem;">Mobile App</td>
          <td style="padding: 1rem; text-align: center;">✅</td>
          <td style="padding: 1rem; text-align: center;">❌</td>
          <td style="padding: 1rem; text-align: center;">✅</td>
        </tr>
        <tr>
          <td style="padding: 1rem;">Price Point</td>
          <td style="padding: 1rem; text-align: center; color: #28a745; font-weight: bold;">$99/mo</td>
          <td style="padding: 1rem; text-align: center;">$299/mo</td>
          <td style="padding: 1rem; text-align: center;">$199/mo</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;
  }

  private generateTeamSlide(): string {
    return `
<div class="slide">
  <h1>Our Team</h1>
  <div style="margin-top: 2rem;">
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
      ${this.config.founders.slice(0, 3).map((founder, i) => `
        <div style="text-align: center; padding: 1.5rem; background: #f8f9fa; border-radius: 10px;">
          <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5em;">
            ${founder.charAt(0)}
          </div>
          <h3 style="margin-bottom: 0.5rem;">${founder}</h3>
          <p style="color: #666;">Founder ${i === 0 ? '& CEO' : i === 1 ? '& CTO' : '& COO'}</p>
          <p style="font-size: 0.9em; margin-top: 0.5rem; color: #888;">
            ${i === 0 ? 'Ex-Google, Stanford MBA' : i === 1 ? 'Ex-Facebook, MIT PhD' : 'Ex-Amazon, Harvard MBA'}
          </p>
        </div>
      `).join('')}
    </div>
    <div style="margin-top: 2rem; background: #e8f4f8; padding: 2rem; border-radius: 10px;">
      <h2>Advisory Board</h2>
      <p style="font-size: 1.1em; margin-top: 1rem;">
        Backed by industry veterans from Google, Meta, and Y Combinator
      </p>
    </div>
  </div>
</div>`;
  }

  private generateFinancialsSlide(): string {
    return `
<div class="slide">
  <h1>Financial Projections</h1>
  <div style="margin-top: 2rem;">
    <div style="display: flex; justify-content: space-around; align-items: flex-end; height: 350px; border-bottom: 2px solid #ddd; margin-bottom: 2rem;">
      <div style="width: 18%; background: linear-gradient(to top, #6a11cb, #2575fc); height: 25%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; color: white; padding-bottom: 1rem;">
        <strong>2024</strong>
        <span>$850K</span>
      </div>
      <div style="width: 18%; background: linear-gradient(to top, #6a11cb, #2575fc); height: 45%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; color: white; padding-bottom: 1rem;">
        <strong>2025</strong>
        <span>$2.5M</span>
      </div>
      <div style="width: 18%; background: linear-gradient(to top, #6a11cb, #2575fc); height: 70%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; color: white; padding-bottom: 1rem;">
        <strong>2026</strong>
        <span>$8.2M</span>
      </div>
      <div style="width: 18%; background: linear-gradient(to top, #6a11cb, #2575fc); height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; color: white; padding-bottom: 1rem;">
        <strong>2027</strong>
        <span>$22M</span>
      </div>
    </div>
    <div style="background: #f8f9fa; padding: 2rem; border-radius: 10px;">
      <h3>Path to Profitability: Q4 2026</h3>
      <p style="font-size: 1.1em; margin-top: 1rem;">Revenue grows 3x year-over-year while maintaining healthy unit economics</p>
    </div>
  </div>
</div>`;
  }

  private generateAskSlide(): string {
    return `
<div class="slide" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
  <h1 style="font-size: 3em; margin-bottom: 2rem;">The Ask</h1>
  <div style="text-align: center; margin: 3rem 0;">
    <h2 style="font-size: 4em; margin-bottom: 1rem;">${this.config.askAmount}</h2>
    <p style="font-size: 1.5em; opacity: 0.9;">Seed Round</p>
  </div>
  <div style="margin-top: 3rem;">
    <h2 style="font-size: 2em; margin-bottom: 1.5rem;">Use of Funds</h2>
    <div style="background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 10px;">
      <ul style="font-size: 1.3em; line-height: 2.5;">
        <li>Product Development: 40% ($${parseFloat(this.config.askAmount.replace(/[$M,]/g, '')) * 0.4}M)</li>
        <li>Sales & Marketing: 35% ($${parseFloat(this.config.askAmount.replace(/[$M,]/g, '')) * 0.35}M)</li>
        <li>Team Expansion: 20% ($${parseFloat(this.config.askAmount.replace(/[$M,]/g, '')) * 0.20}M)</li>
        <li>Operations: 5% ($${parseFloat(this.config.askAmount.replace(/[$M,]/g, '')) * 0.05}M)</li>
      </ul>
    </div>
  </div>
</div>`;
  }

  private generateClosingSlide(): string {
    return `
<div class="slide" style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; text-align: center;">
  <h1 style="font-size: 3.5em; margin-bottom: 1em;">Let's Build the Future Together</h1>
  <p style="font-size: 1.8em; opacity: 0.9; margin-bottom: 3em;">${this.config.companyName}</p>
  <div style="margin-top: 4rem;">
    <p style="font-size: 1.3em; opacity: 0.8;">Contact: ${this.config.founders[0]}</p>
    <p style="font-size: 1.1em; opacity: 0.7; margin-top: 1rem;">www.${this.config.companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
  </div>
</div>`;
  }

  private wrapInHTML(slides: string[]): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.config.companyName} - Investor Pitch Deck</title>
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
    .slide h1 { font-size: 2.8em; margin-bottom: 1rem; }
    .slide h2 { font-size: 1.8em; margin: 1rem 0; }
    .slide p, .slide li { font-size: 1.1em; line-height: 1.6; }
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
  const generator = new StartupPitchGenerator({
    companyName: 'NexGen AI',
    tagline: 'Democratizing AI for Everyone',
    founders: ['Alex Johnson', 'Sarah Chen', 'Mike Rodriguez'],
    problem: 'Current AI tools are too complex, expensive, and require technical expertise, limiting access to only large enterprises.',
    solution: 'We provide a no-code AI platform that anyone can use to build, deploy, and scale AI solutions in minutes, not months.',
    marketSize: '$150B growing to $280B by 2028',
    businessModel: 'Subscription-based SaaS with tiered pricing',
    askAmount: '$2.5M',
    use: 'Product development, market expansion, and team growth'
  });

  const html = await generator.generate();
  console.log('✅ Startup pitch deck generated successfully!');
  console.log(`📊 Total length: ${html.length} characters`);
  console.log(`💼 Ready for investor presentations!`);

  return html;
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { StartupPitchGenerator, PitchDeckConfig };
