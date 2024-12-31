import DOMPurify from 'dompurify';

export interface ISanitizerConfig {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
}

export class SanitizerService {
  private static instance: SanitizerService;

  public static getInstance(): SanitizerService {
    if (!this.instance) {
      this.instance = new SanitizerService();
    }
    return this.instance;
  }

  sanitize(value: string, config: ISanitizerConfig = {ALLOWED_TAGS: [], ALLOWED_ATTR: []}): string {
    if (!value) return '';
    return DOMPurify.sanitize(value, config).trim();
  }
}