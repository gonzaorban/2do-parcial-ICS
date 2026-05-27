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
];

export function getRandomExcuse(): Excuse {
  const index = Math.floor(Math.random() * EXCUSES.length);
  return EXCUSES[index];
}

export function validateAllExcuses(): boolean {
  return EXCUSES.every((excuse) => ExcuseSchema.safeParse(excuse).success);
}

export function getAllExcuses(): readonly Excuse[] {
  return EXCUSES;
}
