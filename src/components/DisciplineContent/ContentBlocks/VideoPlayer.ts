/**
 * VideoPlayer Component
 * Componente de player de vídeo customizado
 */

import './VideoPlayer.css';

export interface VideoPlayerOptions {
  src: string;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

/**
 * Classe VideoPlayer para vídeos
 */
export class VideoPlayer {
  /**
   * Cria um player de vídeo
   */
  static create(options: VideoPlayerOptions): HTMLElement {
    const {
      src,
      poster,
      title,
      autoplay = false,
      muted = false,
      controls = true,
      className = ''
    } = options;

    const container = document.createElement('div');
    container.className = `video-player ${className}`.trim();

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'video-player-title';
      titleEl.textContent = title;
      container.appendChild(titleEl);
    }

    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-player-container';

    const video = document.createElement('video');
    video.className = 'video-player-element';
    video.src = src;
    if (poster) video.poster = poster;
    video.autoplay = autoplay;
    video.muted = muted;
    video.controls = controls;
    video.preload = 'metadata';

    videoContainer.appendChild(video);
    container.appendChild(videoContainer);

    return container;
  }

  /**
   * Cria player para YouTube
   */
  static youtube(videoId: string, title?: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'video-player';

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'video-player-title';
      titleEl.textContent = title;
      container.appendChild(titleEl);
    }

    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-player-container video-player-youtube';

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';

    videoContainer.appendChild(iframe);
    container.appendChild(videoContainer);

    return container;
  }

  /**
   * Cria player para Vimeo
   */
  static vimeo(videoId: string, title?: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'video-player';

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'video-player-title';
      titleEl.textContent = title;
      container.appendChild(titleEl);
    }

    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-player-container video-player-vimeo';

    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${videoId}`;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';

    videoContainer.appendChild(iframe);
    container.appendChild(videoContainer);

    return container;
  }
}

