import { useEffect } from 'react';

interface Meta {
  title?: string;
  description?: string;
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Lightweight per-page document title + description management. */
export function usePageMeta({ title, description }: Meta) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) setMeta('description', description);
  }, [title, description]);
}
