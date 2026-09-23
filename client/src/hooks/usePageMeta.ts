import { useEffect } from 'react';

interface Meta {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

function setMeta(name: string, content: string) {
  const attr = name.startsWith('og:') ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Lightweight per-page document title + description + Open Graph management. */
export function usePageMeta({ title, description, image, url }: Meta) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMeta('og:title', title);
      setMeta('twitter:title', title);
    }
    if (description) {
      setMeta('description', description);
      setMeta('og:description', description);
      setMeta('twitter:description', description);
    }
    if (image) {
      setMeta('og:image', image);
      setMeta('twitter:image', image);
      setMeta('twitter:card', 'summary_large_image');
    }
    if (url) {
      setMeta('og:url', url);
    }
  }, [title, description, image, url]);
}
