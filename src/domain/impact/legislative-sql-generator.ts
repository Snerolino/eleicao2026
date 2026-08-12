/**
 * Gerador SQL puro do planner de importação legislativa (Fase 2, Task 6).
 *
 * Recebe o plano de `planLegislativeImport` e emite comandos SQL idempotentes
 * compatíveis com a migration `20260810090000_create_legislative_core.sql`.
 *
 * REGRAS:
 *  - Nenhuma conexão, execução ou `apply` — somente geração de texto.
 *  - Referências lógicas chegam como `{ logical_ref: 'tabela:partes...' }` no
 *    payload. O gerador as resolve via subselects usando FKs naturais
 *    (house+external_id, proposition_id+version_key), nunca UUIDs fabricados.
 *  - Strings são escapadas (dobra aspas simples); valores nulos viram `null`.
 *  - Determinístico: mesma entrada → mesmo SQL.
 *
 * Responsabilidade de execução (fora deste módulo): aplicar o SQL via
 * service_role autorizado, somente após revisão humana.
 */
import type { DryRunOperation, DryRunPlan } from './legislative-importer.ts';
import { resolveSupportRefs, collectSupportRefs, type SupportCatalogs } from './legislative-support-resolver.ts';

interface LogicalRef {
  logical_ref: string;
}

function isLogicalRef(value: unknown): value is LogicalRef {
  return typeof value === 'object' && value !== null && 'logical_ref' in value;
}

/** Extrai o valor SQL de um campo do payload (resolve logical_ref → subselect/UUID). */
function fieldSql(value: unknown, resolutions?: Record<string, string | null>): string {
  if (value === null || value === undefined) return 'null';
  if (isLogicalRef(value)) {
    const ref = value.logical_ref;
    const resolved = resolutions?.[ref];
    if (resolved) return `'${resolved}'`; // UUID real resolvido pelo catálogo
    return resolveLogicalRef(ref); // FK do núcleo legislativo → subselect
  }
  return sqlStr(value);
}

function sqlStr(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Resolve uma referência lógica em subselect SQL que devolve o UUID alvo. */
function resolveLogicalRef(ref: string): string {
  const parts = ref.split(':');
  const table = parts[0];
  switch (table) {
    case 'legislative_propositions': {
      const [, house, externalId] = parts;
      return `(select id from legislative_propositions where house = ${sqlStr(house)} and external_id = ${sqlStr(externalId)})`;
    }
    case 'proposition_versions': {
      const [, house, externalId, versionKey] = parts;
      return `(select pv.id from proposition_versions pv join legislative_propositions lp on lp.id = pv.proposition_id where lp.house = ${sqlStr(house)} and lp.external_id = ${sqlStr(externalId)} and pv.version_key = ${sqlStr(versionKey)})`;
    }
    case 'voting_events': {
      const [, house, externalId] = parts;
      return `(select ve.id from voting_events ve where ve.house = ${sqlStr(house)} and ve.external_id = ${sqlStr(externalId)})`;
    }
    case 'legislators':
    case 'candidates':
    case 'source_references':
    default:
      // Tabelas de apoio: mantém a referência lógica como comentário seguro.
      // Na execução real, essas FKs devem ser resolvidas por um loader próprio.
      return `null /* ${sqlStr(ref)} */`;
  }
}

function cols(payload: Record<string, unknown>): string {
  return Object.keys(payload).join(', ');
}

function vals(payload: Record<string, unknown>, resolutions?: Record<string, string | null>): string {
  return Object.values(payload).map((v) => fieldSql(v, resolutions)).join(', ');
}

function updateSet(payload: Record<string, unknown>, pk: string[], resolutions?: Record<string, string | null>): string {
  return Object.entries(payload)
    .filter(([k]) => !pk.includes(k))
    .map(([k, v]) => `${k} = ${fieldSql(v, resolutions)}`)
    .join(', ');
}

/** Gera o bloco SQL de uma operação, resolvendo FKs por referência lógica. */
export function operationToSql(op: DryRunOperation, resolutions?: Record<string, string | null>): string {
  const p = op.payload as Record<string, unknown>;
  switch (op.table) {
    case 'legislative_propositions': {
      const pk = ['house', 'external_id'];
      return `insert into legislative_propositions (${cols(p)}) values (${vals(p, resolutions)}) on conflict (house, external_id) do update set ${updateSet(p, pk, resolutions)};`;
    }
    case 'proposition_versions': {
      const insertCols = Object.keys(p);
      const insertVals = Object.values(p).map((v) => fieldSql(v, resolutions));
      const setClause = Object.keys(p)
        .filter((k) => k !== 'proposition_id' && k !== 'version_key')
        .map((k) => `${k} = ${fieldSql(p[k], resolutions)}`)
        .join(', ');
      return `insert into proposition_versions (${insertCols.join(', ')}) values (${insertVals.join(', ')}) on conflict (proposition_id, version_key) do update set ${setClause};`;
    }
    case 'voting_events': {
      const insertCols = Object.keys(p);
      const insertVals = Object.values(p).map((v) => fieldSql(v, resolutions));
      const setClause = Object.keys(p)
        .filter((k) => k !== 'proposition_version_id' && k !== 'external_id')
        .map((k) => `${k} = ${fieldSql(p[k], resolutions)}`)
        .join(', ');
      return `insert into voting_events (${insertCols.join(', ')}) values (${insertVals.join(', ')}) on conflict (house, external_id) do update set ${setClause};`;
    }
    case 'legislative_votes': {
      const insertCols = ['voting_event_id', 'legislator_id', 'candidate_id', 'value', 'absence_type', 'recorded_at', 'source_reference_id'];
      const insertVals = [
        fieldSql(p.voting_event_id, resolutions),
        fieldSql(p.legislator_id, resolutions),
        fieldSql(p.candidate_id ?? null, resolutions),
        fieldSql(p.value, resolutions),
        fieldSql(p.absence_type ?? null, resolutions),
        fieldSql(p.recorded_at, resolutions),
        fieldSql(p.source_reference_id ?? null, resolutions),
      ];
      return `insert into legislative_votes (${insertCols.join(', ')}) values (${insertVals.join(', ')});`;
    }
    default:
      return '';
  }
}

/** Gera o SQL completo do plano (bloco determinístico). */
export function planToSql(plan: DryRunPlan, catalogs?: SupportCatalogs): string {
  const resolutions = catalogs ? resolveSupportRefs(collectSupportRefs(plan), catalogs).resolved : undefined;
  const lines = plan.operations
    .map((op) => operationToSql(op, resolutions))
    .filter((line) => line.length > 0);
  if (lines.length === 0) return '-- Nenhuma operação a gerar.\n';
  return lines.join('\n') + '\n';
}
