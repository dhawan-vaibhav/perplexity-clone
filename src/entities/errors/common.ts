export class InputParseError extends Error {
    constructor(message: string, options?: { cause?: unknown }) {
      super(message);
      this.name = 'InputParseError';
      this.cause = options?.cause;
    }
  }