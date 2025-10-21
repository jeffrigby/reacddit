declare module "dotenv-defaults" {
  export interface DotenvConfigOptions {
    path?: string;
    encoding?: string;
    defaults?: string;
  }

  export interface DotenvConfigOutput {
    error?: Error;
    parsed?: Record<string, string>;
  }

  export function config(options?: DotenvConfigOptions): DotenvConfigOutput;
  export function parse(src: string): Record<string, string>;
}
