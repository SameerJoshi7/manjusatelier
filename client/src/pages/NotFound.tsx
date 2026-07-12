import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function NotFound() {
  usePageMeta({ title: "Page Not Found — Manju's Atelier" });
  return (
    <div className="container-x grid min-h-[70vh] place-items-center text-center">
      <div>
        <p className="font-serif text-8xl text-brown/20 dark:text-beige/20">404</p>
        <h1 className="mt-2 font-serif text-4xl text-brown-dark dark:text-beige">
          This page wandered off
        </h1>
        <p className="mt-3 text-brown/60 dark:text-beige/60">
          The page you&apos;re looking for doesn&apos;t exist, but our handmade treasures do.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button size="lg">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
