/**
 * Video Embed Support (P1.7)
 * YouTube, Vimeo, and HTML5 video integration
 * Responsive embeds with accessibility features
 */

export interface VideoEmbed {
  type: 'youtube' | 'vimeo' | 'html5';
  url: string;
  videoId?: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  options: VideoOptions;
}

export interface VideoOptions {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  startTime?: number; // seconds
  endTime?: number; // seconds
  aspectRatio?: '16:9' | '4:3' | '1:1';
  width?: number | string;
  height?: number | string;
}

export class VideoEmbedManager {
  /**
   * Parse video URL and extract metadata
   */
  parseVideoURL(url: string): VideoEmbed | null {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return {
        type: 'youtube',
        url,
        videoId: youtubeMatch[1],
        title: 'YouTube Video',
        options: { controls: true, autoplay: false }
      };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        url,
        videoId: vimeoMatch[1],
        title: 'Vimeo Video',
        options: { controls: true, autoplay: false }
      };
    }

    // HTML5 video (mp4, webm, ogg)
    if (/\.(mp4|webm|ogg)$/i.test(url)) {
      return {
        type: 'html5',
        url,
        title: 'Video',
        options: { controls: true, autoplay: false }
      };
    }

    return null;
  }

  /**
   * Generate embed HTML for YouTube
   */
  generateYouTubeEmbed(embed: VideoEmbed): string {
    const params = new URLSearchParams();
    if (embed.options.autoplay) params.append('autoplay', '1');
    if (embed.options.muted) params.append('mute', '1');
    if (embed.options.loop) params.append('loop', '1');
    if (embed.options.controls === false) params.append('controls', '0');
    if (embed.options.startTime) params.append('start', String(embed.options.startTime));
    if (embed.options.endTime) params.append('end', String(embed.options.endTime));

    const aspectRatio = embed.options.aspectRatio || '16:9';
    const [w, h] = aspectRatio.split(':');
    const paddingBottom = (parseInt(h) / parseInt(w) * 100).toFixed(2);

    return `
<div class="video-embed video-embed-youtube" style="position: relative; padding-bottom: ${paddingBottom}%; height: 0; overflow: hidden;">
  <iframe
    src="https://www.youtube.com/embed/${embed.videoId}?${params.toString()}"
    title="${embed.title}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
  ></iframe>
</div>
    `.trim();
  }

  /**
   * Generate embed HTML for Vimeo
   */
  generateVimeoEmbed(embed: VideoEmbed): string {
    const params = new URLSearchParams();
    if (embed.options.autoplay) params.append('autoplay', '1');
    if (embed.options.muted) params.append('muted', '1');
    if (embed.options.loop) params.append('loop', '1');

    const aspectRatio = embed.options.aspectRatio || '16:9';
    const [w, h] = aspectRatio.split(':');
    const paddingBottom = (parseInt(h) / parseInt(w) * 100).toFixed(2);

    return `
<div class="video-embed video-embed-vimeo" style="position: relative; padding-bottom: ${paddingBottom}%; height: 0; overflow: hidden;">
  <iframe
    src="https://player.vimeo.com/video/${embed.videoId}?${params.toString()}"
    title="${embed.title}"
    frameborder="0"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
  ></iframe>
</div>
    `.trim();
  }

  /**
   * Generate embed HTML for HTML5 video
   */
  generateHTML5Embed(embed: VideoEmbed): string {
    const attrs: string[] = [];
    if (embed.options.controls !== false) attrs.push('controls');
    if (embed.options.autoplay) attrs.push('autoplay');
    if (embed.options.muted) attrs.push('muted');
    if (embed.options.loop) attrs.push('loop');

    return `
<video
  class="video-embed video-embed-html5"
  ${attrs.join(' ')}
  style="width: 100%; height: auto; max-width: 100%;"
  aria-label="${embed.title}"
>
  <source src="${embed.url}" type="video/mp4">
  <p>Your browser doesn't support HTML5 video. <a href="${embed.url}">Download the video</a>.</p>
</video>
    `.trim();
  }

  /**
   * Generate embed HTML (auto-detect type)
   */
  generateEmbed(url: string, options: VideoOptions = {}): string {
    const embed = this.parseVideoURL(url);
    if (!embed) return '';

    embed.options = { ...embed.options, ...options };

    switch (embed.type) {
      case 'youtube':
        return this.generateYouTubeEmbed(embed);
      case 'vimeo':
        return this.generateVimeoEmbed(embed);
      case 'html5':
        return this.generateHTML5Embed(embed);
      default:
        return '';
    }
  }
}

export const videoEmbedManager = new VideoEmbedManager();
