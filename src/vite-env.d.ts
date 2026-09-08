/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Your own JSON POST endpoint for the callback form. Wins over the key below. */
  readonly VITE_FORM_ENDPOINT?: string
  /** Access key from https://web3forms.com/ — sends the form with no backend. */
  readonly VITE_WEB3FORMS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
