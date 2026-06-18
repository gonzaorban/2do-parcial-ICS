import { getAllExcuses } from '@/lib/excuse.service';

// Intentional Jest failure to demonstrate the Unit tests gate of the CI.
// The catalog has 19 excuses; we assert 999 on purpose so the suite fails
// and `npm test` exits non-zero, stopping the pipeline at the test step.
describe('jest-break (intentional failure)', () => {
  it('fails on purpose to demonstrate the Jest gate', () => {
    expect(getAllExcuses()).toHaveLength(999);
  });
});
