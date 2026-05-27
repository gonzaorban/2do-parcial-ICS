import { ExcuseSchema } from '@/lib/excuse.schema';
import {
  getRandomExcuse,
  validateAllExcuses,
  getAllExcuses,
} from '@/lib/excuse.service';

const ALLOWED_SEVERITIES = ['leve', 'grave', 'critica'] as const;

describe('excuse.service', () => {
  it('the whole catalog passes the Zod schema', () => {
    expect(validateAllExcuses()).toBe(true);
  });

  it('getRandomExcuse() always returns a schema-valid object (50 iterations)', () => {
    for (let i = 0; i < 50; i++) {
      const result = ExcuseSchema.safeParse(getRandomExcuse());
      expect(result.success).toBe(true);
    }
  });

  it('every excuse has a severity within the allowed enum', () => {
    for (const excuse of getAllExcuses()) {
      expect(ALLOWED_SEVERITIES).toContain(excuse.severity);
    }
  });
});
