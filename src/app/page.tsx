import ExcuseGenerator from '@/components/ExcuseGenerator';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-8 sm:p-16 bg-gradient-to-b from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800">
      <header className="text-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50">
          Generador de Excusas para no entregar el TP
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Hecho con cariño para que no te bochen en el parcial.
        </p>
      </header>

      <section className="flex-1 flex items-center justify-center w-full">
        <ExcuseGenerator />
      </section>

      <footer className="mt-12 text-center text-sm text-zinc-500">
        <p>
          Si tu excusa falla, recordá: nunca fue tu culpa, siempre fue el firewall.
        </p>
      </footer>
    </main>
  );
}
