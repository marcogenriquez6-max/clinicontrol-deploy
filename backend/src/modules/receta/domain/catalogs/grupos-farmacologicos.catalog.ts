/**
 * Catalogo de grupos farmacologicos para el cruce de alergias.
 *
 * POR QUE EXISTE
 * La comprobacion de alergias comparaba el nombre del farmaco con el nombre de
 * la alergia por subcadena. Con eso, un paciente alergico a la PENICILINA al
 * que se prescribe AMOXICILINA no generaba ninguna alerta: ninguna de las dos
 * cadenas contiene a la otra, pese a que la amoxicilina ES una penicilina.
 *
 * Este catalogo agrupa los principios activos por familia y declara las
 * reacciones cruzadas conocidas entre familias, de modo que el motor razone
 * por grupo y no por texto.
 *
 * ALCANCE Y LIMITES
 * Es un catalogo de apoyo a la decision, no una fuente farmacologica oficial.
 * Cubre las familias de uso frecuente en atencion ambulatoria. Antes de un uso
 * asistencial real debe ser revisado y ampliado por un profesional farmaceutico.
 * La alerta que produce es siempre una advertencia: la decision es del medico.
 */

export interface GrupoFarmacologico {
  clave: string;
  /** Nombre legible, el que aparece en el mensaje de alerta. */
  nombre: string;
  /** Fragmentos que identifican a un farmaco como miembro del grupo. */
  medicamentos: string[];
  /** Como puede estar escrita la alergia en la ficha del paciente. */
  sinonimosAlergia: string[];
  /** Grupos con reactividad cruzada documentada: la alerta baja un nivel. */
  reaccionCruzada?: string[];
}

export const GRUPOS_FARMACOLOGICOS: GrupoFarmacologico[] = [
  {
    clave: 'penicilinas',
    nombre: 'Penicilinas',
    medicamentos: [
      'penicilina',
      'amoxicilina',
      'ampicilina',
      'cloxacilina',
      'dicloxacilina',
      'oxacilina',
      'piperacilina',
      'ticarcilina',
      'bencilpenicilina',
      'benzatinica',
      'clavulanico',
    ],
    sinonimosAlergia: [
      'penicilina',
      'penicilinas',
      'betalactamico',
      'betalactamicos',
      'beta-lactamico',
    ],
    reaccionCruzada: ['cefalosporinas', 'carbapenemicos'],
  },
  {
    clave: 'cefalosporinas',
    nombre: 'Cefalosporinas',
    medicamentos: [
      'cefalexina',
      'cefazolina',
      'cefadroxilo',
      'cefuroxima',
      'cefaclor',
      'ceftriaxona',
      'cefotaxima',
      'ceftazidima',
      'cefepima',
      'cefixima',
    ],
    sinonimosAlergia: ['cefalosporina', 'cefalosporinas'],
    reaccionCruzada: ['penicilinas'],
  },
  {
    clave: 'carbapenemicos',
    nombre: 'Carbapenemicos',
    medicamentos: ['meropenem', 'imipenem', 'ertapenem'],
    sinonimosAlergia: ['carbapenemico', 'carbapenemicos'],
    reaccionCruzada: ['penicilinas'],
  },
  {
    clave: 'aines',
    nombre: 'Antiinflamatorios no esteroideos (AINE)',
    medicamentos: [
      'ibuprofeno',
      'diclofenaco',
      'naproxeno',
      'ketorolaco',
      'ketoprofeno',
      'piroxicam',
      'meloxicam',
      'indometacina',
      'celecoxib',
      'etoricoxib',
      'aspirina',
      'acido acetilsalicilico',
      'acetilsalicilico',
      'nimesulida',
    ],
    sinonimosAlergia: [
      'aine',
      'aines',
      'antiinflamatorio',
      'antiinflamatorios',
      'aspirina',
      'acido acetilsalicilico',
    ],
  },
  {
    clave: 'sulfonamidas',
    nombre: 'Sulfonamidas',
    medicamentos: [
      'sulfametoxazol',
      'cotrimoxazol',
      'trimetoprima',
      'sulfadiazina',
      'sulfasalazina',
    ],
    sinonimosAlergia: [
      'sulfa',
      'sulfas',
      'sulfonamida',
      'sulfonamidas',
      'sulfamida',
      'sulfamidas',
    ],
  },
  {
    clave: 'macrolidos',
    nombre: 'Macrolidos',
    medicamentos: [
      'eritromicina',
      'azitromicina',
      'claritromicina',
      'espiramicina',
    ],
    sinonimosAlergia: ['macrolido', 'macrolidos'],
  },
  {
    clave: 'quinolonas',
    nombre: 'Quinolonas',
    medicamentos: [
      'ciprofloxacino',
      'ciprofloxacina',
      'levofloxacino',
      'norfloxacino',
      'moxifloxacino',
      'ofloxacino',
    ],
    sinonimosAlergia: [
      'quinolona',
      'quinolonas',
      'fluoroquinolona',
      'fluoroquinolonas',
    ],
  },
  {
    clave: 'aminoglucosidos',
    nombre: 'Aminoglucosidos',
    medicamentos: [
      'gentamicina',
      'amikacina',
      'estreptomicina',
      'tobramicina',
      'neomicina',
    ],
    sinonimosAlergia: ['aminoglucosido', 'aminoglucosidos'],
  },
  {
    clave: 'tetraciclinas',
    nombre: 'Tetraciclinas',
    medicamentos: [
      'tetraciclina',
      'doxiciclina',
      'minociclina',
      'oxitetraciclina',
    ],
    sinonimosAlergia: ['tetraciclina', 'tetraciclinas'],
  },
  {
    clave: 'opioides',
    nombre: 'Opioides',
    medicamentos: [
      'morfina',
      'tramadol',
      'codeina',
      'fentanilo',
      'petidina',
      'meperidina',
      'oxicodona',
    ],
    sinonimosAlergia: [
      'opioide',
      'opioides',
      'opiaceo',
      'opiaceos',
      'morfina',
      'codeina',
    ],
  },
  {
    clave: 'anestesicos-locales',
    nombre: 'Anestesicos locales',
    medicamentos: [
      'lidocaina',
      'bupivacaina',
      'procaina',
      'mepivacaina',
      'articaina',
    ],
    sinonimosAlergia: [
      'anestesico local',
      'anestesicos locales',
      'lidocaina',
      'xilocaina',
    ],
  },
];

/** Quita tildes y pasa a minusculas, para comparar sin depender de la escritura. */
export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/** Grupos a los que pertenece un medicamento, por nombre comercial o principio activo. */
export function gruposDelMedicamento(
  nombreMedicamento: string,
): GrupoFarmacologico[] {
  const n = normalizar(nombreMedicamento);
  return GRUPOS_FARMACOLOGICOS.filter((g) =>
    g.medicamentos.some((m) => n.includes(normalizar(m))),
  );
}

/** Grupos a los que apunta una alergia registrada, por su nombre. */
export function gruposDeLaAlergia(nombreAlergia: string): GrupoFarmacologico[] {
  const n = normalizar(nombreAlergia);
  return GRUPOS_FARMACOLOGICOS.filter(
    (g) =>
      g.sinonimosAlergia.some((s) => n.includes(normalizar(s))) ||
      g.medicamentos.some((m) => n.includes(normalizar(m))),
  );
}
