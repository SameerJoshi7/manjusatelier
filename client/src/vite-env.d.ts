/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Razorpay checkout is loaded from a script tag at runtime.
interface Window {
  Razorpay: new (options: Record<string, unknown>) => { open: () => void };
}
