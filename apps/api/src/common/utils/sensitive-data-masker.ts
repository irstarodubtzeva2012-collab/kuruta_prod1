import { Injectable, Logger } from '@nestjs/common';

/**
 * Sensitive Data Masker
 * Маскирует чувствительные данные перед логированием
 */
@Injectable()
export class SensitiveDataMasker {
  private readonly logger = new Logger(SensitiveDataMasker.name);

  // Паттерны для маскирования
  private readonly patterns = [
    {
      name: 'password',
      regex: /"password"\s*:\s*"[^"]*"/gi,
      replacement: '"password":"***MASKED***"',
    },
    {
      name: 'token',
      regex: /"(access|refresh)?token"\s*:\s*"[^"]*"/gi,
      replacement: '"token":"***MASKED***"',
    },
    {
      name: 'authorization',
      regex: /authorization:\s*bearer\s+[^\s,}]+/gi,
      replacement: 'authorization: bearer ***MASKED***',
    },
    {
      name: 'card_number',
      regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      replacement: '****-****-****-****',
    },
    {
      name: 'cvv',
      regex: /"cvv"\s*:\s*"\d{3,4}"/gi,
      replacement: '"cvv":"***"',
    },
    {
      name: 'secret',
      regex: /"(secret|api_key|apikey|private_key)"\s*:\s*"[^"]*"/gi,
      replacement: '"$1":"***MASKED***"',
    },
    {
      name: 'email',
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      replacement: (match: string) => {
        const [local, domain] = match.split('@');
        return `${local[0]}***@${domain}`;
      },
    },
    {
      name: 'phone',
      regex: /\+?\d{10,15}/g,
      replacement: (match: string) => {
        return match.slice(0, 3) + '***' + match.slice(-2);
      },
    },
  ];

  /**
   * Маскирует чувствительные данные в объекте
   */
  mask(obj: any): any {
    if (!obj) return obj;

    try {
      let str = JSON.stringify(obj);

      for (const pattern of this.patterns) {
        if (typeof pattern.replacement === 'function') {
          str = str.replace(pattern.regex, pattern.replacement as any);
        } else {
          str = str.replace(pattern.regex, pattern.replacement);
        }
      }

      return JSON.parse(str);
    } catch (error) {
      this.logger.error('Failed to mask sensitive data', error);
      return obj;
    }
  }

  /**
   * Маскирует строку
   */
  maskString(str: string): string {
    let result = str;

    for (const pattern of this.patterns) {
      if (typeof pattern.replacement === 'function') {
        result = result.replace(pattern.regex, pattern.replacement as any);
      } else {
        result = result.replace(pattern.regex, pattern.replacement);
      }
    }

    return result;
  }
}
