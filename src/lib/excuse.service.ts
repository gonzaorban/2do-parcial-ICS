import { randomInt } from 'crypto';
import { ExcuseSchema, type Excuse } from './excuse.schema';

const EXCUSES: Excuse[] = [
  {
    id: 1,
    text: 'Un ransomware me cifró el TP y el atacante me pide pagar en doge.',
    severity: 'critica',
  },
  {
    id: 2,
    text: 'Me hicieron phishing y el repo terminó en manos de un grupo APT.',
    severity: 'critica',
  },
  {
    id: 3,
    text: 'El SOC marcó mi commit como falso positivo y me bloqueó el push.',
    severity: 'grave',
  },
  {
    id: 4,
    text: 'Mi VPN colapsó justo cuando iba a clonar el repo, juro que es verdad.',
    severity: 'leve',
  },
  {
    id: 5,
    text: 'Borré el .env de producción pensando que era el de desarrollo.',
    severity: 'critica',
  },
  {
    id: 6,
    text: 'Se me rompió Docker y no sé qué es un contenedor sin internet.',
    severity: 'leve',
  },
  {
    id: 7,
    text: 'El pentest de la cátedra me marcó el TP como vulnerable y lo cuarentené yo mismo.',
    severity: 'grave',
  },
  {
    id: 8,
    text: 'Git me dijo "detached HEAD" y entré en pánico existencial.',
    severity: 'leve',
  },
  {
    id: 9,
    text: 'Hardcodee la API key en el README y ahora estoy rotando credenciales.',
    severity: 'grave',
  },
  {
    id: 10,
    text: 'La sql inyection no es un problema mio, es solamente mi base de datos que es flexible a consultas de todo tipo.',
    severity: 'grave',
  },
  {
    id: 11,
    text: 'Hice git push --force a main justo antes de la entrega y pisé el código del grupo.',
    severity: 'critica',
  },
  {
    id: 12,
    text: 'Subí las credenciales de la base de datos a un repo público y GitHub me mandó un advisory.',
    severity: 'critica',
  },
  {
    id: 13,
    text: 'El pipeline de CI falló en prod y el rollback también falló. Estamos investigando.',
    severity: 'critica',
  },
  {
    id: 14,
    text: 'El SonarCloud me dio una deuda técnica de 3 semanas y entré en crisis.',
    severity: 'grave',
  },
  {
    id: 15,
    text: 'Playwright detectó un XSS en mi propio TP y no puedo entregarlo con esa vulnerabilidad.',
    severity: 'grave',
  },
  {
    id: 16,
    text: 'Mi linter configurado como pre-commit hook rechazó 847 archivos y me quedé sin tiempo.',
    severity: 'grave',
  },
  {
    id: 17,
    text: 'Me olvidé de hacer npm install después del pull y culpé a TypeScript 40 minutos.',
    severity: 'leve',
  },
  {
    id: 18,
    text: 'Estuve debuggeando 2 horas un bug que era un console.log comentado.',
    severity: 'leve',
  },
  {
    id: 19,
    text: 'El node_modules me llenó el disco y no pude hacer el build.',
    severity: 'leve',
  },
];

export function getRandomExcuse(): Excuse {
  const index = randomInt(0, EXCUSES.length);
  return EXCUSES[index];
}

export function validateAllExcuses(): boolean {
  return EXCUSES.every((excuse) => ExcuseSchema.safeParse(excuse).success);
}

export function getAllExcuses(): readonly Excuse[] {
  return EXCUSES;
}