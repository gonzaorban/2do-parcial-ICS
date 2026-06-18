import ExcuseGenerator from '@/components/ExcuseGenerator';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-8 sm:p-16 bg-gradient-to-b from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800">
      <header className="text-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50">
          Generador de Excusas para no entregar el TP
        </h1>
      </header>

      <section className="flex-1 flex items-center justify-center w-full">
        <ExcuseGenerator />
      </section>

      <footer className="mt-12 w-full max-w-md border-t border-zinc-300 pt-6 text-center dark:border-zinc-700">
        <p className="font-medium text-zinc-700 dark:text-zinc-300">
          Gonzalo Tomás Orban
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Ingeniería y Calidad de Software
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          2do Parcial · 2026
        </p>
      </footer>
    </main>
  );
}
