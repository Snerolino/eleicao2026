import { validateImpactContract } from './contract.ts';

/**
 * Contrato operacional local v1 do importer legislativo.
 *
 * O contrato JSON histórico só descreve `propositions[]` e o voto factual
 * individual. Este envelope adiciona a relação necessária para o dry-run:
 * `propositions[].versions[].voting_events[]` e `votes[].voting_event_id`.
 * Os IDs nessa fronteira são referências lógicas, nunca UUIDs locais.
 */
export const LEGISLATIVE_IMPORT_SCHEMA_VERSION = '1.0.0';

const HOUSES = ['camara', 'senado', 'alrs', 'camara_municipal'] as const;
const PROPOSITION_TYPES = ['pec', 'pl', 'plp', 'pld', 'lei', 'outro'] as const;
const VOTE_VALUES = ['sim', 'nao', 'abstencao', 'ausente', 'obstrucao'] as const;
const ABSENCE_TYPES = ['estrategica', 'obstrucao_coordenada', 'justificada'] as const;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;
const DERIVED_VOTE_FIELDS = [
  'impact',
  'impact_matrix',
  'impact_direction',
  'alignment',
  'score',
  'ideology',
  'recommendation',
  'group',
  'defending_vote',
  'confidence',
  'rationale',
  'methodology_version',
] as const;

type House = (typeof HOUSES)[number];
type PropositionType = (typeof PROPOSITION_TYPES)[number];
type VoteValue = (typeof VOTE_VALUES)[number];
type AbsenceType = (typeof ABSENCE_TYPES)[number];

export interface LegislativeImportEnvelope {
  schema_version: string;
  country: 'BR';
  state: 'RS';
  election_year: 2026;
  propositions: PropositionInput[];
  votes: VoteInput[];
}

export interface PropositionInput {
  external_id: string;
  house: House;
  proposition_type: PropositionType;
  number: number;
  year: number;
  title: string;
  summary?: string | null;
  official_url?: string | null;
  versions: PropositionVersionInput[];
}

export interface PropositionVersionInput {
  version_key: string;
  version_label: string;
  text_hash: string;
  effective_from: string;
  source?: string | null;
  impact_matrix?: Record<string, unknown>;
  voting_events: VotingEventInput[];
}

export interface VotingEventInput {
  external_id: string;
  house: House;
  session_id?: string | null;
  vote_round?: string | null;
  occurred_at: string;
  source?: string | null;
}

export interface VoteInput {
  voting_event_id: string;
  deputy_id: string;
  proposition_version_id: string;
  value: VoteValue;
  absence_type?: AbsenceType | null;
  recorded_at: string;
  source: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface NormalizationResult extends ValidationResult {
  data: LegislativeImportEnvelope | null;
}

export interface LogicalRef {
  logical_ref: string;
}

export interface DryRunOperation {
  action: 'upsert' | 'insert';
  table: 'legislative_propositions' | 'proposition_versions' | 'voting_events' | 'legislative_votes';
  key: Record<string, string>;
  payload: Record<string, unknown>;
}

export interface DryRunPlan {
  schema_version: typeof LEGISLATIVE_IMPORT_SCHEMA_VERSION;
  mode: 'dry-run';
  counts: Record<DryRunOperation['table'], number>;
  operations: DryRunOperation[];
}

export interface DryRunResult extends ValidationResult {
  plan: DryRunPlan | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function checkKeys(value: Record<string, unknown>, allowed: readonly string[], path: string, errors: string[]): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) errors.push(`${path}.${key} não pertence ao contrato v${LEGISLATIVE_IMPORT_SCHEMA_VERSION}`);
  }
}

function requiredString(value: unknown, path: string, errors: string[]): value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${path} deve ser string não vazia`);
    return false;
  }
  return true;
}

function optionalString(value: unknown, path: string, errors: string[]): boolean {
  if (value === undefined || value === null) return true;
  return requiredString(value, path, errors);
}

function validateUrl(value: unknown, path: string, errors: string[], required: boolean): void {
  if (value === undefined || value === null) {
    if (required) errors.push(`${path} é obrigatória`);
    return;
  }
  if (typeof value !== 'string' || /\s/.test(value)) {
    errors.push(`${path} deve ser URL HTTP(S)`);
    return;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') errors.push(`${path} deve ser URL HTTP(S)`);
  } catch {
    errors.push(`${path} deve ser URL HTTP(S)`);
  }
}

function validateDate(value: unknown, path: string, errors: string[]): void {
  if (typeof value !== 'string' || !DATE_TIME.test(value) || Number.isNaN(Date.parse(value))) {
    errors.push(`${path} deve ser data ISO date-time válida`);
  }
}

function enumValue<T extends string>(value: unknown, values: readonly T[], path: string, errors: string[]): value is T {
  if (!values.includes(value as T)) {
    errors.push(`${path} inválido: ${String(value)}`);
    return false;
  }
  return true;
}

function logicalRef(table: string, ...parts: string[]): LogicalRef {
  return { logical_ref: [table, ...parts].join(':') };
}

function propositionRef(proposition: PropositionInput): string {
  return logicalRef('legislative_propositions', proposition.house, proposition.external_id).logical_ref;
}

function sourceRef(url: string | null): LogicalRef | null {
  return url === null ? null : logicalRef('source_references', url);
}

function validateImpactMatrix(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${path} deve ser um objeto`);
    return;
  }
  if (hasOwn(value, 'votes')) errors.push(`${path}.votes é proibido: votos pertencem ao envelope factual`);
  const result = validateImpactContract(value);
  for (const error of result.errors) errors.push(`${path}.${error}`);
}

function validateVote(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${path} deve ser um objeto`);
    return;
  }
  const allowed = ['voting_event_id', 'deputy_id', 'proposition_version_id', 'value', 'absence_type', 'recorded_at', 'source'];
  checkKeys(value, allowed, path, errors);
  for (const field of DERIVED_VOTE_FIELDS) {
    if (hasOwn(value, field)) errors.push(`${path}.${field} é derivado e proibido em votos`);
  }
  requiredString(value.voting_event_id, `${path}.voting_event_id`, errors);
  requiredString(value.deputy_id, `${path}.deputy_id`, errors);
  requiredString(value.proposition_version_id, `${path}.proposition_version_id`, errors);
  const validValue = enumValue(value.value, VOTE_VALUES, `${path}.value`, errors);
  const absence = value.absence_type;
  if (validValue && (value.value === 'sim' || value.value === 'nao' || value.value === 'abstencao')) {
    if (absence !== undefined && absence !== null) {
      errors.push(`${path}.absence_type deve ser ausente ou null para value=${value.value}`);
    }
  } else if (validValue) {
    if (!enumValue(absence, ABSENCE_TYPES, `${path}.absence_type`, errors)) {
      errors.push(`${path}.absence_type é obrigatório para value=${value.value}`);
    }
  }
  validateDate(value.recorded_at, `${path}.recorded_at`, errors);
  validateUrl(value.source, `${path}.source`, errors, true);
}

function validateEnvelope(input: unknown): { errors: string[]; duplicatePaths: Set<string> } {
  const errors: string[] = [];
  const duplicatePaths = new Set<string>();
  if (!isRecord(input)) return { errors: ['envelope deve ser um objeto'], duplicatePaths };
  checkKeys(input, ['schema_version', 'country', 'state', 'election_year', 'propositions', 'votes'], '', errors);
  if (input.schema_version !== LEGISLATIVE_IMPORT_SCHEMA_VERSION) {
    errors.push(`schema_version esperado ${LEGISLATIVE_IMPORT_SCHEMA_VERSION}, recebido ${String(input.schema_version)}`);
  }
  if (input.country !== 'BR') errors.push('country deve ser BR');
  if (input.state !== 'RS') errors.push('state deve ser RS');
  if (input.election_year !== 2026) errors.push('election_year deve ser 2026');
  if (!Array.isArray(input.propositions)) errors.push('propositions deve ser array');
  if (!Array.isArray(input.votes)) errors.push('votes deve ser array');
  if (!Array.isArray(input.propositions) || !Array.isArray(input.votes)) return { errors, duplicatePaths };

  const propositions = new Map<string, string>();
  const versions = new Map<string, string>();
  const events = new Map<string, string>();
  const eventVersions = new Map<string, string>();
  const votes = new Map<string, string>();

  for (const [i, propositionValue] of input.propositions.entries()) {
    const path = `propositions[${i}]`;
    if (!isRecord(propositionValue)) {
      errors.push(`${path} deve ser um objeto`);
      continue;
    }
    checkKeys(propositionValue, ['external_id', 'house', 'proposition_type', 'number', 'year', 'title', 'summary', 'official_url', 'versions'], path, errors);
    const validExternal = requiredString(propositionValue.external_id, `${path}.external_id`, errors);
    const validHouse = enumValue(propositionValue.house, HOUSES, `${path}.house`, errors);
    enumValue(propositionValue.proposition_type, PROPOSITION_TYPES, `${path}.proposition_type`, errors);
    if (!Number.isInteger(propositionValue.number) || (propositionValue.number as number) <= 0) errors.push(`${path}.number deve ser inteiro positivo`);
    if (!Number.isInteger(propositionValue.year) || (propositionValue.year as number) < 1900) errors.push(`${path}.year inválido`);
    requiredString(propositionValue.title, `${path}.title`, errors);
    optionalString(propositionValue.summary, `${path}.summary`, errors);
    validateUrl(propositionValue.official_url, `${path}.official_url`, errors, false);
    if (!Array.isArray(propositionValue.versions) || propositionValue.versions.length === 0) {
      errors.push(`${path}.versions deve ser array não vazio`);
      continue;
    }
    if (validExternal && validHouse) {
      const key = `${propositionValue.house}:${propositionValue.external_id}`;
      const fingerprint = stableJson(propositionValue);
      const previous = propositions.get(key);
      if (previous && previous !== fingerprint) errors.push(`${path} duplicidade ambígua para ${key}`);
      else if (previous) duplicatePaths.add(path);
      else propositions.set(key, fingerprint);
    }
    for (const [j, versionValue] of propositionValue.versions.entries()) {
      const versionPath = `${path}.versions[${j}]`;
      if (!isRecord(versionValue)) {
        errors.push(`${versionPath} deve ser um objeto`);
        continue;
      }
      checkKeys(versionValue, ['version_key', 'version_label', 'text_hash', 'effective_from', 'source', 'impact_matrix', 'voting_events'], versionPath, errors);
      const validVersionKey = requiredString(versionValue.version_key, `${versionPath}.version_key`, errors);
      requiredString(versionValue.version_label, `${versionPath}.version_label`, errors);
      requiredString(versionValue.text_hash, `${versionPath}.text_hash`, errors);
      validateDate(versionValue.effective_from, `${versionPath}.effective_from`, errors);
      validateUrl(versionValue.source, `${versionPath}.source`, errors, false);
      if (versionValue.impact_matrix !== undefined) validateImpactMatrix(versionValue.impact_matrix, `${versionPath}.impact_matrix`, errors);
      if (!Array.isArray(versionValue.voting_events)) {
        errors.push(`${versionPath}.voting_events deve ser array`);
        continue;
      }
      if (validExternal && validHouse && validVersionKey) {
        const key = `${propositionValue.house}:${propositionValue.external_id}:${versionValue.version_key}`;
        const fingerprint = stableJson(versionValue);
        const previous = versions.get(key);
        if (previous && previous !== fingerprint) errors.push(`${versionPath} duplicidade ambígua para ${key}`);
        else if (previous) duplicatePaths.add(versionPath);
        else versions.set(key, fingerprint);
      }
      for (const [k, eventValue] of versionValue.voting_events.entries()) {
        const eventPath = `${versionPath}.voting_events[${k}]`;
        if (!isRecord(eventValue)) {
          errors.push(`${eventPath} deve ser um objeto`);
          continue;
        }
        checkKeys(eventValue, ['external_id', 'house', 'session_id', 'vote_round', 'occurred_at', 'source'], eventPath, errors);
        const validEventId = requiredString(eventValue.external_id, `${eventPath}.external_id`, errors);
        const validEventHouse = enumValue(eventValue.house, HOUSES, `${eventPath}.house`, errors);
        if (validHouse && validEventHouse && eventValue.house !== propositionValue.house) errors.push(`${eventPath}.house deve coincidir com a proposição`);
        optionalString(eventValue.session_id, `${eventPath}.session_id`, errors);
        optionalString(eventValue.vote_round, `${eventPath}.vote_round`, errors);
        validateDate(eventValue.occurred_at, `${eventPath}.occurred_at`, errors);
        validateUrl(eventValue.source, `${eventPath}.source`, errors, false);
        if (validEventId && validEventHouse) {
          const key = `${eventValue.house}:${eventValue.external_id}`;
          const fingerprint = stableJson(eventValue);
          const previous = events.get(key);
          if (previous && previous !== fingerprint) errors.push(`${eventPath} duplicidade ambígua para ${key}`);
          else if (previous) duplicatePaths.add(eventPath);
          else events.set(key, fingerprint);
          if (validExternal && validHouse && validVersionKey) {
            const eventVersion = `${propositionValue.house}:${propositionValue.external_id}:${versionValue.version_key}`;
            const previousVersion = eventVersions.get(key);
            if (previousVersion && previousVersion !== eventVersion) errors.push(`${eventPath} referencia versões diferentes para a mesma chave de evento`);
            else eventVersions.set(key, eventVersion);
          }
        }
      }
    }
  }

  for (const [i, voteValue] of input.votes.entries()) {
    const path = `votes[${i}]`;
    validateVote(voteValue, path, errors);
    if (!isRecord(voteValue)) continue;
    const eventId = typeof voteValue.voting_event_id === 'string' ? voteValue.voting_event_id : null;
    const deputyId = typeof voteValue.deputy_id === 'string' ? voteValue.deputy_id : null;
    const versionId = typeof voteValue.proposition_version_id === 'string' ? voteValue.proposition_version_id : null;
    if (eventId && !events.has(eventId.replace(/^voting_events:/, ''))) errors.push(`${path}.voting_event_id referencia evento inexistente: ${eventId}`);
    if (versionId && !versions.has(versionId.replace(/^proposition_versions:/, ''))) errors.push(`${path}.proposition_version_id referencia versão inexistente: ${versionId}`);
    if (eventId && deputyId) {
      const key = `${eventId}:${deputyId}`;
      const fingerprint = stableJson(voteValue);
      const previous = votes.get(key);
      if (previous && previous !== fingerprint) errors.push(`${path} duplicidade ambígua para ${key}`);
      else if (previous) duplicatePaths.add(path);
      else votes.set(key, fingerprint);
    }
  }

  for (const [i, voteValue] of input.votes.entries()) {
    if (!isRecord(voteValue)) continue;
    const eventId = typeof voteValue.voting_event_id === 'string' ? voteValue.voting_event_id.replace(/^voting_events:/, '') : null;
    const versionId = typeof voteValue.proposition_version_id === 'string' ? voteValue.proposition_version_id.replace(/^proposition_versions:/, '') : null;
    if (!eventId || !versionId) continue;
    const expectedVersion = eventVersions.get(eventId);
    if (expectedVersion && versionId !== expectedVersion) errors.push(`votes[${i}].proposition_version_id não corresponde ao evento referenciado`);
  }

  return { errors, duplicatePaths };
}

function normalizeDate(value: string): string {
  return new Date(value).toISOString();
}

function normalizeEnvelope(input: LegislativeImportEnvelope, duplicatePaths: Set<string>): LegislativeImportEnvelope {
  const propositions: PropositionInput[] = [];
  const propositionKeys = new Set<string>();
  for (const [i, proposition] of input.propositions.entries()) {
    const propKey = `${proposition.house}:${proposition.external_id}`;
    if (duplicatePaths.has(`propositions[${i}]`) || propositionKeys.has(propKey)) continue;
    propositionKeys.add(propKey);
    const versions: PropositionVersionInput[] = [];
    const versionKeys = new Set<string>();
    for (const [j, version] of proposition.versions.entries()) {
      const key = `${propKey}:${version.version_key}`;
      if (duplicatePaths.has(`propositions[${i}].versions[${j}]`) || versionKeys.has(key)) continue;
      versionKeys.add(key);
      const events: VotingEventInput[] = [];
      const eventKeys = new Set<string>();
      for (const event of version.voting_events) {
        const eventKey = `${event.house}:${event.external_id}`;
        if (eventKeys.has(eventKey)) continue;
        eventKeys.add(eventKey);
        events.push({
          external_id: event.external_id.trim(),
          house: event.house,
          session_id: event.session_id?.trim() ?? null,
          vote_round: event.vote_round?.trim() ?? null,
          occurred_at: normalizeDate(event.occurred_at),
          source: event.source?.trim() ?? null,
        });
      }
      versions.push({
        version_key: version.version_key.trim(),
        version_label: version.version_label.trim(),
        text_hash: version.text_hash.trim(),
        effective_from: normalizeDate(version.effective_from),
        source: version.source?.trim() ?? null,
        ...(version.impact_matrix ? { impact_matrix: structuredClone(version.impact_matrix) } : {}),
        voting_events: events,
      });
    }
    propositions.push({
      external_id: proposition.external_id.trim(),
      house: proposition.house,
      proposition_type: proposition.proposition_type,
      number: proposition.number,
      year: proposition.year,
      title: proposition.title.trim(),
      summary: proposition.summary?.trim() ?? null,
      official_url: proposition.official_url?.trim() ?? null,
      versions,
    });
  }
  const votes: VoteInput[] = [];
  const voteKeys = new Set<string>();
  for (const vote of input.votes) {
    const key = `${vote.voting_event_id}:${vote.deputy_id}`;
    if (voteKeys.has(key)) continue;
    voteKeys.add(key);
    votes.push({
      voting_event_id: vote.voting_event_id.trim(),
      deputy_id: vote.deputy_id.trim(),
      proposition_version_id: vote.proposition_version_id.trim(),
      value: vote.value,
      absence_type: vote.absence_type ?? null,
      recorded_at: normalizeDate(vote.recorded_at),
      source: vote.source.trim(),
    });
  }
  return {
    schema_version: LEGISLATIVE_IMPORT_SCHEMA_VERSION,
    country: 'BR',
    state: 'RS',
    election_year: 2026,
    propositions,
    votes,
  };
}

export function validateLegislativeImport(input: unknown): ValidationResult {
  const { errors } = validateEnvelope(input);
  return { ok: errors.length === 0, errors };
}

export function normalizeLegislativeImport(input: unknown): NormalizationResult {
  const result = validateEnvelope(input);
  if (result.errors.length > 0) return { ok: false, errors: result.errors, data: null };
  return { ok: true, errors: [], data: normalizeEnvelope(input as LegislativeImportEnvelope, result.duplicatePaths) };
}

function operation(action: DryRunOperation['action'], table: DryRunOperation['table'], key: Record<string, string>, payload: Record<string, unknown>): DryRunOperation {
  return { action, table, key, payload };
}

export function planLegislativeImport(input: unknown): DryRunResult {
  const normalized = normalizeLegislativeImport(input);
  if (!normalized.ok || !normalized.data) return { ok: false, errors: normalized.errors, plan: null };
  const data = normalized.data;
  const operations: DryRunOperation[] = [];
  for (const proposition of data.propositions) {
    operations.push(operation('upsert', 'legislative_propositions', { house: proposition.house, external_id: proposition.external_id }, {
      external_id: proposition.external_id,
      house: proposition.house,
      proposition_type: proposition.proposition_type,
      number: proposition.number,
      year: proposition.year,
      title: proposition.title,
      summary: proposition.summary,
      official_url: proposition.official_url,
    }));
  }
  for (const proposition of data.propositions) {
    const propositionId = propositionRef(proposition);
    for (const version of proposition.versions) {
      operations.push(operation('upsert', 'proposition_versions', { proposition_id: propositionId, version_key: version.version_key }, {
        proposition_id: logicalRef('legislative_propositions', proposition.house, proposition.external_id),
        version_key: version.version_key,
        version_label: version.version_label,
        text_hash: version.text_hash,
        source_reference_id: sourceRef(version.source ?? null),
        effective_from: version.effective_from,
      }));
    }
  }
  for (const proposition of data.propositions) {
    for (const version of proposition.versions) {
      for (const event of version.voting_events) {
        operations.push(operation('upsert', 'voting_events', { house: event.house, external_id: event.external_id }, {
          proposition_version_id: logicalRef('proposition_versions', proposition.house, proposition.external_id, version.version_key),
          external_id: event.external_id,
          house: event.house,
          session_id: event.session_id,
          vote_round: event.vote_round,
          occurred_at: event.occurred_at,
          source_reference_id: sourceRef(event.source ?? null),
        }));
      }
    }
  }
  for (const vote of data.votes) {
    operations.push(operation('insert', 'legislative_votes', {
      voting_event_id: vote.voting_event_id,
      legislator_ref: vote.deputy_id,
    }, {
      voting_event_id: logicalRef('voting_events', vote.voting_event_id.replace(/^voting_events:/, '')),
      legislator_id: null,
      candidate_id: logicalRef('legislators', vote.deputy_id),
      value: vote.value,
      absence_type: vote.absence_type,
      recorded_at: vote.recorded_at,
      source_reference_id: sourceRef(vote.source),
    }));
  }
  const counts = {
    legislative_propositions: operations.filter((item) => item.table === 'legislative_propositions').length,
    proposition_versions: operations.filter((item) => item.table === 'proposition_versions').length,
    voting_events: operations.filter((item) => item.table === 'voting_events').length,
    legislative_votes: operations.filter((item) => item.table === 'legislative_votes').length,
  };
  return { ok: true, errors: [], plan: { schema_version: LEGISLATIVE_IMPORT_SCHEMA_VERSION, mode: 'dry-run', counts, operations } };
}
