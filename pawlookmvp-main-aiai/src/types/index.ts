export interface GroomingStyle {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface DogPhoto {
  dataUrl: string;
  fileName: string;
}

export interface Groomer {
  id: string;
  name: string;
  district: string;
  priceFrom: number;
  rating: number;
  reviewCount: number;
  styles: string[]; // style ids
  isDemo: true;
}

export type GenerationStage =
  | 'idle'
  | 'analyzing'
  | 'matching'
  | 'rendering'
  | 'done';

export interface GenerationResult {
  styleId: string;
  originalPhoto: string;
  resultImage: string; // real AI-generated image (data URL) returned by the backend
  generatedAt: number;
}

/**
 * Error codes surfaced by the real AI grooming service. The UI uses these to
 * decide what message to show and whether "spróbuj ponownie" makes sense.
 */
export type GenerationErrorCode =
  | 'no-photo'
  | 'invalid-format'
  | 'too-large'
  | 'network'
  | 'timeout'
  | 'rate-limited'
  | 'api-error'
  | 'no-image-returned';

export class GenerationError extends Error {
  code: GenerationErrorCode;
  constructor(code: GenerationErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'GenerationError';
  }
}

export type Screen =
  | 'home'
  | 'upload'
  | 'style-select'
  | 'generating'
  | 'result'
  | 'groomers';
