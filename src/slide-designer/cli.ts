#!/usr/bin/env node
/**
 * CLI Tool for Slide Designer
 * Generate presentations from command line
 */

import * as fs from 'fs';
import * as path from 'path';

interface CLIOptions {
  topic: string;
  slides?: number;
  theme?: 'light' | 'dark' | 'corporate' | 'modern';
  output?: string;
  format?: 'html' | 'pdf';
  images?: boolean;
  icons?: boolean;
  type?: 'business' | 'education' | 'pitch' | 'general';
}

class SlideDesignerCLI {
  private options: CLIOptions;

  constructor(options: CLIOptions) {
    this.options = {
      slides: 10,
      theme: 'modern',
      output: './presentation.html',
      format: 'html',
      images: true,
      icons: true,
      type: 'general',
      ...options
    };
  }

  async run(): Promise<void> {
    console.log('🎨 Slide Designer CLI\n');
    console.log(`📝 Topic: ${this.options.topic}`);
    console.log(`📊 Slides: ${this.options.slides}`);
    console.log(`🎭 Theme: ${this.options.theme}`);
    console.log(`📁 Output: ${this.options.output}\n`);

    try {
      console.log('⏳ Generating presentation...');

      // Step 1: Generate content
      const content = await this.generateContent();
      console.log('✅ Content generated');

      // Step 2: Design layouts
      const layouts = await this.designLayouts(content);
      console.log('✅ Layouts designed');

      // Step 3: Find assets
      if (this.options.images || this.options.icons) {
        await this.findAssets();
        console.log('✅ Assets collected');
      }

      // Step 4: Render HTML
      const html = await this.renderHTML(content, layouts);
      console.log('✅ HTML rendered');

      // Step 5: Save to file
      await this.saveToFile(html);
      console.log(`\n✨ Presentation saved to: ${this.options.output}`);

      // Step 6: Show summary
      this.showSummary(html);

    } catch (error) {
      console.error('\n❌ Error generating presentation:', error);
      process.exit(1);
    }
  }

  private async generateContent(): Promise<any> {
    // Mock content generation
    const slides = [];
    for (let i = 0; i < (this.options.slides || 10); i++) {
      slides.push({
        number: i + 1,
        title: i === 0 ? this.options.topic : `Slide ${i + 1}`,
        content: `Content for slide ${i + 1} about ${this.options.topic}`
      });
    }
    return { slides };
  }

  private async designLayouts(content: any): Promise<any> {
    // Mock layout design
    return content.slides.map((slide: any, index: number) => ({
      ...slide,
      layout: index === 0 ? 'title' : index === content.slides.length - 1 ? 'conclusion' : 'content'
    }));
  }

  private async findAssets(): Promise<void> {
    // Mock asset finding
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async renderHTML(content: any, layouts: any): Promise<string> {
    const slidesHTML = layouts.map((slide: any) => `
<div class="slide slide-${slide.layout}" data-slide="${slide.number}">
  <h1>${slide.title}</h1>
  <div class="content">
    <p>${slide.content}</p>
  </div>
</div>
    `.trim()).join('\n\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.options.topic}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Segoe UI', sans-serif;
      scroll-snap-type: y mandatory;
      overflow-y: scroll;
      height: 100vh;
    }
    .slide {
      min-height: 100vh;
      padding: 4rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      scroll-snap-align: start;
      page-break-after: always;
    }
    .slide-title {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    .slide-conclusion {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      text-align: center;
    }
    .slide h1 { font-size: 2.5em; margin-bottom: 2rem; }
    .slide .content { font-size: 1.3em; line-height: 1.8; }
    @media print { .slide { page-break-after: always; } }
  </style>
  <script>
    document.addEventListener('keydown', (e) => {
      const slides = document.querySelectorAll('.slide');
      const current = Math.floor(window.scrollY / window.innerHeight);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (current < slides.length - 1) {
          slides[current + 1].scrollIntoView({ behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (current > 0) {
          slides[current - 1].scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  </script>
</head>
<body>
${slidesHTML}
</body>
</html>`;
  }

  private async saveToFile(html: string): Promise<void> {
    const outputPath = path.resolve(this.options.output || './presentation.html');
    const dir = path.dirname(outputPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html, 'utf8');
  }

  private showSummary(html: string): void {
    console.log('\n📊 Summary:');
    console.log(`   Total slides: ${this.options.slides}`);
    console.log(`   File size: ${(html.length / 1024).toFixed(2)} KB`);
    console.log(`   Theme: ${this.options.theme}`);
    console.log(`   Format: ${this.options.format}`);
  }

  static parseArgs(args: string[]): CLIOptions | null {
    const options: Partial<CLIOptions> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--topic':
        case '-t':
          options.topic = args[++i];
          break;
        case '--slides':
        case '-s':
          options.slides = parseInt(args[++i], 10);
          break;
        case '--theme':
          options.theme = args[++i] as any;
          break;
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
        case '--format':
        case '-f':
          options.format = args[++i] as any;
          break;
        case '--no-images':
          options.images = false;
          break;
        case '--no-icons':
          options.icons = false;
          break;
        case '--type':
          options.type = args[++i] as any;
          break;
        case '--help':
        case '-h':
          SlideDesignerCLI.showHelp();
          return null;
        default:
          if (!arg.startsWith('-') && !options.topic) {
            options.topic = arg;
          }
      }
    }

    if (!options.topic) {
      console.error('❌ Error: Topic is required\n');
      SlideDesignerCLI.showHelp();
      return null;
    }

    return options as CLIOptions;
  }

  static showHelp(): void {
    console.log(`
🎨 Slide Designer CLI

Usage:
  slide-designer <topic> [options]
  slide-designer --topic "My Presentation" [options]

Options:
  -t, --topic <string>      Topic for the presentation (required)
  -s, --slides <number>     Number of slides (default: 10)
  --theme <theme>           Theme: light, dark, corporate, modern (default: modern)
  -o, --output <path>       Output file path (default: ./presentation.html)
  -f, --format <format>     Output format: html, pdf (default: html)
  --type <type>             Presentation type: business, education, pitch, general
  --no-images               Don't include images
  --no-icons                Don't include icons
  -h, --help                Show this help message

Examples:
  # Basic usage
  slide-designer "Introduction to AI"

  # Custom slides and output
  slide-designer "Machine Learning" --slides 15 --output ml-deck.html

  # Business presentation with theme
  slide-designer "Q4 Review" --type business --theme corporate

  # Pitch deck without images
  slide-designer "Startup Pitch" --type pitch --no-images --slides 12

For more information, visit: https://github.com/ruvnet/agentic-flow
`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    SlideDesignerCLI.showHelp();
    process.exit(0);
  }

  const options = SlideDesignerCLI.parseArgs(args);

  if (!options) {
    process.exit(1);
  }

  const cli = new SlideDesignerCLI(options);
  await cli.run();
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { SlideDesignerCLI, CLIOptions };
