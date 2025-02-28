/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly UI_DEBUG: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}