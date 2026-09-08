// Minimal ambient declaration so we don't need @types/node as a dependency
// just to read environment variables in the serverless function.
declare const process: {
  env: { [key: string]: string | undefined };
};
