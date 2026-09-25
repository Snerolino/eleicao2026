export const RELEASE_STATES = Object.freeze({
  FACTUAL_READY: 'factual_ready',
  IMPACT_READY_FOR_REVIEW: 'impact_ready_for_review',
  IMPACT_RELEASE_READY: 'impact_release_ready',
  WITHHELD_SOURCE: 'withheld_source',
  WITHHELD_IDENTITY: 'withheld_identity',
  WITHHELD_COMPOUND: 'withheld_compound',
  WITHHELD_PROCEDURAL: 'withheld_procedural',
  WITHHELD_ATTRIBUTION: 'withheld_attribution',
  REMOTE_UNKNOWN: 'remote_unknown',
});

const SCOREABLE_STATUSES = new Set(['approved', 'contested']);
const SCOREABLE_EVENT_TYPES = new Set(['isolated', 'compound_separable']);

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function classifySourceGate(item) {
  if (item?.remote_state === 'unknown') return RELEASE_STATES.REMOTE_UNKNOWN;
  if (!hasText(item?.event_source_reference_id) || !hasText(item?.version_source_reference_id)) {
    return RELEASE_STATES.WITHHELD_SOURCE;
  }
  if (item?.object_voted_required === true && !hasText(item?.object_source_reference_id)) {
    return RELEASE_STATES.WITHHELD_SOURCE;
  }
  if (item?.assessment_source_required === true && item?.assessment_has_source !== true) {
    return RELEASE_STATES.WITHHELD_SOURCE;
  }
  return null;
}

export function classifyIdentityGate(item) {
  if (item?.identity_status === 'collision' || item?.identity_status === 'ambiguous') {
    return RELEASE_STATES.WITHHELD_IDENTITY;
  }
  if (item?.identity_status !== 'exact') return RELEASE_STATES.WITHHELD_IDENTITY;
  return null;
}

export function classifyEventGate(item) {
  if (item?.event_status === 'procedural' || item?.object_voted_kind === 'procedural') {
    return RELEASE_STATES.WITHHELD_PROCEDURAL;
  }
  if (item?.event_status === 'compound_non_separable' || item?.vote_attribution_status === 'compound_non_separable') {
    return RELEASE_STATES.WITHHELD_COMPOUND;
  }
  if (item?.event_status && !SCOREABLE_EVENT_TYPES.has(item.event_status)) {
    return RELEASE_STATES.WITHHELD_COMPOUND;
  }
  return null;
}

export function classifyAttributionGate(item) {
  const hasAssessment = item?.assessment_id && item?.assessment_has_source === true;
  if (!hasAssessment) return RELEASE_STATES.WITHHELD_ATTRIBUTION;
  if (!item?.attribution_id) return RELEASE_STATES.WITHHELD_ATTRIBUTION;
  if (item.methodology_version !== '2.0.0') return RELEASE_STATES.WITHHELD_ATTRIBUTION;
  if (!SCOREABLE_STATUSES.has(item.review_status)) return RELEASE_STATES.WITHHELD_ATTRIBUTION;
  if (item.score_eligible !== true) return RELEASE_STATES.WITHHELD_ATTRIBUTION;
  if (!SCOREABLE_EVENT_TYPES.has(item.vote_attribution_status)) return RELEASE_STATES.WITHHELD_ATTRIBUTION;
  if (!['sim', 'nao'].includes(item.event_defending_vote)) return RELEASE_STATES.WITHHELD_ATTRIBUTION;
  if (item.attribution_has_source !== true) return RELEASE_STATES.WITHHELD_ATTRIBUTION;
  if (item.internal_review_approved !== true || item.internal_reviewer_id === item.created_by) {
    return RELEASE_STATES.WITHHELD_ATTRIBUTION;
  }
  if (item.external_review_required === true && item.external_review_approved !== true) {
    return RELEASE_STATES.WITHHELD_ATTRIBUTION;
  }
  return null;
}

export function classifyRelease(item) {
  if (item?.remote_state === 'unknown') return RELEASE_STATES.REMOTE_UNKNOWN;
  const identityState = classifyIdentityGate(item);
  if (identityState) return identityState;
  const sourceState = classifySourceGate(item);
  if (sourceState) return sourceState;
  const eventState = classifyEventGate(item);
  if (eventState) return eventState;

  const factualReady = item?.factual_vote_present === true && item?.candidate_ids?.length > 0;
  const attributionState = classifyAttributionGate(item);
  if (!attributionState) return RELEASE_STATES.IMPACT_RELEASE_READY;
  if (factualReady) return RELEASE_STATES.FACTUAL_READY;
  return attributionState;
}

export function releaseReason(item, state = classifyRelease(item)) {
  const reasons = {
    [RELEASE_STATES.FACTUAL_READY]: 'Voto factual e fonte oficial comprovados; impacto ainda não liberado.',
    [RELEASE_STATES.IMPACT_READY_FOR_REVIEW]: 'Evidência pronta para revisão de atribuição v2.',
    [RELEASE_STATES.IMPACT_RELEASE_READY]: 'Todos os gates de fonte, identidade, evento, atribuição e revisão estão verdes.',
    [RELEASE_STATES.WITHHELD_SOURCE]: 'Fonte oficial do evento, versão, objeto ou assessment ausente.',
    [RELEASE_STATES.WITHHELD_IDENTITY]: 'Identidade do evento ou da versão ambígua/collisionada.',
    [RELEASE_STATES.WITHHELD_COMPOUND]: 'Evento composto não separável ou tipo de evento não liberável.',
    [RELEASE_STATES.WITHHELD_PROCEDURAL]: 'Evento procedural não entra em score de mérito.',
    [RELEASE_STATES.WITHHELD_ATTRIBUTION]: 'Atribuição v2, voto defensor, fonte própria ou revisão independente ausente.',
    [RELEASE_STATES.REMOTE_UNKNOWN]: 'Estado remoto não pôde ser lido; nenhuma liberação é segura.',
  };
  return reasons[state] ?? 'Estado de liberação desconhecido; reter por segurança.';
}

export function inventoryKey(item) {
  return [item?.voting_event_id, item?.assessment_id, item?.methodology_version ?? '2.0.0'].join('|');
}
