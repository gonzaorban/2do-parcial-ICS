import { z } from 'zod';

export const ExcuseSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().min(10).max(200),
  severity: z.enum(['leve', 'grave', 'critica']),
});

export type Excuse = z.infer<typeof ExcuseSchema>;
