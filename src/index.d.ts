declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        readonly ACCESS_TOKEN: string;
        readonly ACCESS_SECRET: string;
        readonly APP_KEY: string;
        readonly APP_SECRET: string;

        readonly NO_TWEET?: string;
      }
    }
  }
}
