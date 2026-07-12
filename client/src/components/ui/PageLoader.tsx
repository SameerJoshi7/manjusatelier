export function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream dark:bg-[#1c1712]">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/logo-256.png"
          alt="Manju's Atelier"
          width={64}
          height={64}
          className="h-16 w-16 animate-pulse rounded-full object-cover ring-1 ring-gold/40"
        />
        <span className="text-sm text-brown/60 dark:text-beige/60">Loading…</span>
      </div>
    </div>
  );
}
