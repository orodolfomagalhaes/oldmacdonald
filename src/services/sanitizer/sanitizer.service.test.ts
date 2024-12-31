import {describe, it, expect, beforeEach} from 'vitest';
import {SanitizerService} from "./sanitizer.service.ts";

describe('SanitizerService', () => {
  let service: SanitizerService;

  beforeEach(() => {
    service = SanitizerService.getInstance();
  });

  it('should sanitize input removing html tag', async () => {
    const sanitized = service.sanitize('<sometag>Random text</sometag>');
    expect(sanitized).toBe('Random text');
  });

  it('should return empty string when no value is informed', async () => {
    const sanitized = service.sanitize('');
    expect(sanitized).toBe('');
  });

});