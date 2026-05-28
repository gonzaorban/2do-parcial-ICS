'use client';

import { useState } from 'react';
import type { Excuse } from '@/lib/excuse.schema';

const severityStyles: Record<Excuse['severity'], string> = {
  leve: 'bg-green-100 text-green-800 border-green-300',
  grave: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  critica: 'bg-red-100 text-red-800 border-red-300',
};

const severityLabels: Record<Excuse['severity'], string> = {
  leve: 'Leve',
  grave: 'Grave',
  critica: 'Crítica',
};

export default function ExcuseGenerator() {
  const [excuse, setExcuse] = useState<Excuse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchExcuse() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/excuse', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as Excuse;
      setExcuse(data);
    } catch (err) {
      setError('No se pudo generar la excusa. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl">
      <button
        type="button"
        onClick={fetchExcuse}
        disabled={loading}
        data-testid="generate-button"
        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Generando...' : 'Generar excusa'}
      </button>

      {error && (
        <p className="text-red-600 text-sm" data-testid="error-message">
          {error}
        </p>
      )}

      {excuse && (
        <article
          data-testid="excuse-card"
          className="w-full p-6 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-700 shadow"
        >
          <p
            data-testid="excuse-text"
            className="text-lg text-zinc-800 dark:text-zinc-100 mb-4"
          >
            {excuse.text}
          </p>
          <span
            data-testid="excuse-severity"
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${severityStyles[excuse.severity]}`}
          >
            Severidad: {severityLabels[excuse.severity]}
          </span>
        </article>
      )}
    </div>
  );
}