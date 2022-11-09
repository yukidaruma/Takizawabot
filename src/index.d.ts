declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        // v2
        readonly ACCESS_TOKEN: string;
        readonly ACCESS_SECRET: string;
        readonly APP_KEY: string;
        readonly APP_SECRET: string;

        // v1
        readonly V1_ACCESS_TOKEN: string;
        readonly V1_ACCESS_SECRET: string;
        readonly V1_APP_KEY: string;
        readonly V1_APP_SECRET: string;

        readonly NO_TWEET?: string;
      }
    }
  }
}
