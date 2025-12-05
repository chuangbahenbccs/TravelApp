/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FOURSQUARE_API_KEY: string;
  readonly VITE_GOOGLE_SERPAPI_KEY: string;
  readonly VITE_GOOGLE_PLACES_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
