import fs from 'node:fs';
import path from 'node:path';
import { loadAllCamaraVotes, buildDeputyToTseMapping, buildProfilesByTse } from './enrich-candidate-voting-profiles.mjs';

export function classifyText(title, desc) {
  const text = `${title || ''} ${desc || ''}`.toLowerCase();

  // 1. Mulheres
  if (
    text.includes('mulher') ||
    text.includes('violência doméstica') ||
    text.includes('feminicídio') ||
    text.includes('maternidade') ||
    text.includes('gestante') ||
    text.includes('assédio') ||
    text.includes('meninas') ||
    text.includes('menina') ||
    text.includes('mamografia') ||
    text.includes('câncer de mama') ||
    text.includes('colo do útero') ||
    text.includes('parto') ||
    text.includes('puerpério') ||
    text.includes('dignidade menstrual') ||
    text.includes('absorvente') ||
    text.includes('plp 41/2024') ||
    text.includes('plp 41')
  ) {
    return {
      group: 'mulheres',
      direction: 'positive',
      defending_vote: 'sim',
      severity: text.includes('feminicídio') || text.includes('violência') ? 4 : 3,
      type: 'structural',
      confidence: 0.95,
      rationale:
        'Legislação voltada à ampliação da proteção, amparo e direitos das mulheres.',
    };
  }

  // 2. LGBTQIA+
  if (
    text.includes('lgbt') ||
    text.includes('diversidade sexual') ||
    text.includes('identidade de gênero') ||
    text.includes('homofobia') ||
    text.includes('transfobia') ||
    text.includes('nome social') ||
    text.includes('lgbtfobia')
  ) {
    return {
      group: 'lgbtqia',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.92,
      rationale:
        'Garantia de direitos civis, cidadania e combate à discriminação por orientação sexual e identidade de gênero.',
    };
  }

  // 3. População Negra e Periférica
  if (
    text.includes('população negra') ||
    text.includes('igualdade racial') ||
    text.includes('periferia') ||
    text.includes('quilombola') ||
    text.includes('antirracista') ||
    text.includes('racismo') ||
    text.includes('injúria racial') ||
    text.includes('pl 4566') ||
    text.includes('comunidade carente') ||
    text.includes('habitação popular') ||
    text.includes('moradia') ||
    text.includes('regularização fundiária urbana')
  ) {
    return {
      group: 'populacao_negra_periferica',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.9,
      rationale:
        'Políticas de promoção da igualdade racial, habitação digna e inclusão social de comunidades periféricas.',
    };
  }

  // 4. Povos Indígenas
  if (
    text.includes('indígena') ||
    text.includes('aldeia') ||
    text.includes('guarani') ||
    text.includes('kaingang') ||
    text.includes('marco temporal') ||
    text.includes('pl 490') ||
    text.includes('terra indígena') ||
    text.includes('povo originário') ||
    text.includes('demarcação')
  ) {
    return {
      group: 'povos_indigenas',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.9,
      rationale:
        'Defesa dos direitos territoriais, saúde indígena e salvaguarda das tradições culturais originárias.',
    };
  }

  // 5. Crianças e Adolescentes em Vulnerabilidade
  if (
    text.includes('criança') ||
    text.includes('adolescente') ||
    text.includes('infância') ||
    text.includes('órfão') ||
    text.includes('orfandade') ||
    text.includes('menor de idade') ||
    text.includes('crimes sexuais contra') ||
    text.includes('pediatria') ||
    text.includes('conselho tutelar') ||
    text.includes('jovem') ||
    text.includes('juventude') ||
    text.includes('amparo à vítima') ||
    text.includes('pl 2630') ||
    text.includes('fust') ||
    text.includes('plp 230') ||
    text.includes('vulnerabilidade social') ||
    text.includes('proteção social')
  ) {
    return {
      group: 'criancas_adolescentes_vulnerabilidade',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 4,
      type: 'structural',
      confidence: 0.95,
      rationale:
        'Política pública de proteção integral, amparo social e prevenção à violência contra crianças e jovens vulneráveis.',
    };
  }

  // 6. Pessoas Idosas Dependentes
  if (
    text.includes('idoso') ||
    text.includes('terceira idade') ||
    text.includes('envelhecimento') ||
    text.includes('estatuto do idoso') ||
    text.includes('asilo') ||
    text.includes('ilpi') ||
    text.includes('geriatria') ||
    text.includes('centro-dia')
  ) {
    return {
      group: 'pessoas_idosas_dependentes',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.92,
      rationale:
        'Proteção, assistência integral e garantia de prioridade e dignidade à população idosa.',
    };
  }

  // 7. Pessoas com Deficiência
  if (
    text.includes('deficiência') ||
    text.includes('pcd') ||
    text.includes('autismo') ||
    text.includes('tea') ||
    text.includes('fibromialgia') ||
    text.includes('acessibilidade') ||
    text.includes('braille') ||
    text.includes('libras') ||
    text.includes('visão monocular') ||
    text.includes('mobilidade reduzida') ||
    text.includes('down') ||
    text.includes('doença rara') ||
    text.includes('cordão de girassol')
  ) {
    return {
      group: 'pessoas_com_deficiencia',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.92,
      rationale:
        'Garantia de acessibilidade, inclusão e atendimento prioritário a pessoas com deficiência ou condições crônicas.',
    };
  }

  // 8. Estudantes
  if (
    text.includes('educação') ||
    text.includes('escola') ||
    text.includes('ensino') ||
    text.includes('estudante') ||
    text.includes('aluno') ||
    text.includes('transporte escolar') ||
    text.includes('merenda') ||
    text.includes('pré-universitário') ||
    text.includes('universidade') ||
    text.includes('uergs') ||
    text.includes('fundeb') ||
    text.includes('pedagógico') ||
    text.includes('alfabetização') ||
    text.includes('livro') ||
    text.includes('biblioteca') ||
    text.includes('passe livre estudantil') ||
    text.includes('bolsa de estudo') ||
    text.includes('prouni') ||
    text.includes('fies')
  ) {
    return {
      group: 'estudantes',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.92,
      rationale:
        'Fomento à educação pública, passe livre estudantil, merenda e infraestrutura da rede de ensino.',
    };
  }

  // 9. Usuários do SUS
  if (
    text.includes('saúde') ||
    text.includes('hospital') ||
    text.includes('sus') ||
    text.includes('medicamento') ||
    text.includes('câncer') ||
    text.includes('vacina') ||
    text.includes('hemodiálise') ||
    text.includes('upa') ||
    text.includes('leitos') ||
    text.includes('oncologia') ||
    text.includes('terapia') ||
    text.includes('doação de sangue') ||
    text.includes('transplante') ||
    text.includes('psicológico') ||
    text.includes('mental') ||
    text.includes('caps') ||
    text.includes('atendimento médico') ||
    text.includes('pl 2110') ||
    text.includes('ipergs') ||
    text.includes('ipe saúde') ||
    text.includes('plano de saúde')
  ) {
    return {
      group: 'usuarios_sus',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'budgetary',
      confidence: 0.9,
      rationale:
        'Fortalecimento do sistema público de saúde, assistência médica/farmacêutica e atendimento aos usuários do SUS.',
    };
  }

  // 10. Agricultura Familiar
  if (
    text.includes('agricultura familiar') ||
    text.includes('pequeno produtor') ||
    text.includes('rural') ||
    text.includes('estiagem') ||
    text.includes('irrigação') ||
    text.includes('assentamento') ||
    text.includes('crédito rural') ||
    text.includes('pronaf') ||
    text.includes('sementes') ||
    text.includes('agropecuária') ||
    text.includes('pesca') ||
    text.includes('colono') ||
    text.includes('safra') ||
    text.includes('abigeato') ||
    text.includes('estradas rurais') ||
    text.includes('porteira para dentro')
  ) {
    return {
      group: 'agricultura_familiar_sem_terra',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.88,
      rationale:
        'Fomento à produção rural familiar, assistência técnica e enfrentamento de perdas no campo.',
    };
  }

  // 11. Trabalhadores Informais
  if (
    text.includes('trabalhador informal') ||
    text.includes('autônomo') ||
    text.includes('ambulante') ||
    text.includes('catador') ||
    text.includes('reciclador') ||
    text.includes('motorista de aplicativo') ||
    text.includes('entregador') ||
    text.includes('artesão') ||
    text.includes('feirante') ||
    text.includes('economia solidária') ||
    text.includes('auxílio gás') ||
    text.includes('mpv 1313') ||
    text.includes('mpv 1323') ||
    text.includes('microempreendedor') ||
    text.includes('mei')
  ) {
    return {
      group: 'trabalhadores_informais',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 2,
      type: 'structural',
      confidence: 0.88,
      rationale:
        'Amparo, economia solidária e inclusão socioprodutiva para categorias de trabalho autônomo e não formalizado.',
    };
  }

  // 12. Trabalhadores Formais
  if (
    text.includes('clt') ||
    text.includes('salário mínimo') ||
    text.includes('fgts') ||
    text.includes('jornada de trabalho') ||
    text.includes('carteira de trabalho') ||
    text.includes('seguro-desemprego') ||
    text.includes('direitos trabalhistas') ||
    text.includes('terceirização') ||
    text.includes('adicional noturno')
  ) {
    return {
      group: 'trabalhadores_formais',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.9,
      rationale:
        'Defesa das garantias trabalhistas, valorização do salário mínimo e proteção do emprego formal.',
    };
  }

  // 13. Servidores Públicos
  if (
    text.includes('magistério') ||
    text.includes('servidor') ||
    text.includes('funcionalismo') ||
    text.includes('reajuste') ||
    text.includes('subsídio') ||
    text.includes('plano de carreira') ||
    text.includes('data-base') ||
    text.includes('quadro de pessoal') ||
    text.includes('concurso público') ||
    text.includes('reforma da previdência') ||
    text.includes('pec 6/2019') ||
    text.includes('pec 6') ||
    text.includes('polícia civil') ||
    text.includes('brigada militar') ||
    text.includes('bombeiro') ||
    text.includes('perito') ||
    text.includes('policial') ||
    text.includes('estatuto') ||
    text.includes('orçamentária') ||
    text.includes('ldo') ||
    text.includes('loa') ||
    text.includes('tributária') ||
    text.includes('taxa') ||
    text.includes('imposto') ||
    text.includes('dívida pública')
  ) {
    return {
      group: 'servidores_publicos',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'budgetary',
      confidence: 0.92,
      rationale:
        'Norma regulamentadora de finanças públicas, diretrizes orçamentárias e estruturação das carreiras públicas.',
    };
  }

  // 14. Pessoas com Ludopatia
  if (
    text.includes('apostas') ||
    text.includes('bets') ||
    text.includes('ludopatia') ||
    text.includes('pl 3626') ||
    text.includes('jogos de azar')
  ) {
    return {
      group: 'pessoas_com_ludopatia',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.9,
      rationale:
        'Regulação de apostas, prevenção ao superendividamento e amparo à saúde mental contra o vício em apostas.',
    };
  }

  return null;
}

export async function runFullReconciliation() {
  const root = process.cwd();
  const reconPath = path.resolve(root, 'data/legislative-import/alrs/alrs-nominal-vote-reconciliation-v1.json');
  const subQueuePath = path.resolve(root, 'data/legislative-import/alrs/substantive-review-queue-v1.json');
  const gabaritoPath = path.resolve(root, 'data/impact-matrices/gabarito-materias-aprovadas.json');
  const publicCandPath = path.resolve(root, 'data/public-candidates.json');
  const nominalVotesPath = path.resolve(root, 'data/candidate-nominal-votes.json');
  const camaraMetaPath = path.resolve(root, 'data/legislative-import/camara/camara-voting-events-metadata.json');

  const recon = JSON.parse(fs.readFileSync(reconPath, 'utf8'));
  const subQueue = fs.existsSync(subQueuePath) ? JSON.parse(fs.readFileSync(subQueuePath, 'utf8')) : { items: [] };
  const gabarito = JSON.parse(fs.readFileSync(gabaritoPath, 'utf8'));
  const publicCandidates = JSON.parse(fs.readFileSync(publicCandPath, 'utf8'));
  const camaraVotes = loadAllCamaraVotes(root);
  const deputyToTse = buildDeputyToTseMapping(root);
  const camaraMeta = fs.existsSync(camaraMetaPath) ? JSON.parse(fs.readFileSync(camaraMetaPath, 'utf8')) : {};

  console.log(`📖 Matriz Canônica Universal carregada: ${gabarito.propositions.length} proposições ativas aprovadas.`);

  // 1. Build subMap for title lookups
  const subMap = new Map();
  for (const item of subQueue.items || []) {
    subMap.set(item.proposition_version_id, item);
  }

  // 2. Build candidate nominal votes in Ultra-Compact integer-indexed normalized schema
  const propsList = [];
  const propIndexMap = new Map();
  const candVotesMap = {};

  function registerProposition(vote) {
    const key = `${vote.house}|${vote.proposition_id}|${vote.title}`;
    let idx = propIndexMap.get(key);
    if (idx === undefined) {
      idx = propsList.length;
      propIndexMap.set(key, idx);
      propsList.push({
        h: vote.house,
        p: vote.proposition_id,
        t: vote.title,
        u: vote.source_url,
        l: vote.source_label,
        g: vote.assessment_group ?? null,
        d: vote.impact_direction ?? null,
        score_eligible: vote.score_eligible ?? (vote.assessment_group && vote.impact_direction && vote.defending_vote ? true : false),
        defending_vote: vote.defending_vote ?? null,
        event_defending_vote: vote.event_defending_vote ?? null,
        textual_defending_vote: vote.textual_defending_vote ?? null,
        vote_attribution_status: vote.vote_attribution_status ?? null,
      });
    }
    return idx;
  }

  function addCandidateVote(tseId, vote) {
    if (!tseId) return;
    const list = candVotesMap[tseId] ?? [];
    const pIdx = registerProposition(vote);
    list.push([pIdx, vote.vote_value, vote.date]);
    candVotesMap[tseId] = list;
  }

  // Accumulate ALRS votes
  const alrsVotesByCand = new Map();
  for (const r of recon.rows) {
    const list = alrsVotesByCand.get(r.tse_candidate_id) || [];
    list.push(r);
    alrsVotesByCand.set(r.tse_candidate_id, list);
  }

  for (const [tseId, rows] of alrsVotesByCand.entries()) {
    for (const r of rows) {
      const subItem = subMap.get(r.proposition_version_id);
      const title = subItem?.title || `${r.proposition_type?.toUpperCase() || 'Votação'} ${r.proposition_number || ''}/${r.proposition_year || ''}`;
      const propNumberNormalized = `${r.proposition_type?.toLowerCase() || 'pl'}-${r.proposition_number || ''}-${r.proposition_year || ''}`;
      
      const gab = gabarito.propositions.find(
        (p) =>
          p.house === 'alrs' &&
          (p.proposition_id === `alrs:${propNumberNormalized}` ||
           (p.type === r.proposition_type?.toLowerCase() && String(p.number) === String(r.proposition_number) && String(p.year) === String(r.proposition_year)))
      );

      const assessment = gab?.assessments?.[0];
      const isScoreEligible = gab && assessment && assessment.score_eligible !== false && assessment.event_defending_vote !== null && (assessment.event_defending_vote || assessment.defending_vote);

      addCandidateVote(tseId, {
        house: 'alrs',
        proposition_id: `${r.proposition_type?.toUpperCase() || 'PROP'} ${r.proposition_number || ''}/${r.proposition_year || ''}`,
        title: gab?.title || title,
        vote_value: r.value,
        date: r.occurred_at ? r.occurred_at.split(' ')[0] : '2026',
        source_url: gab?.official_source_url || r.source_url || 'https://transparencia.al.rs.gov.br/parlamentares/votos-plenario',
        source_label: gab?.official_source_label || 'ALRS Portal da Transparência',
        assessment_group: assessment?.group ?? null,
        impact_direction: assessment?.impact_direction ?? null,
        defending_vote: assessment?.defending_vote ?? null,
        event_defending_vote: assessment?.event_defending_vote ?? null,
        textual_defending_vote: assessment?.textual_defending_vote ?? null,
        score_eligible: isScoreEligible ? true : false,
        vote_attribution_status: assessment?.vote_attribution_status ?? (gab ? 'isolated' : null),
        severity: gab?.severity || 3,
        structural_type: gab?.structural_type || 'structural',
        confidence: assessment?.confidence || 0.95,
      });
    }
  }

  // Camara votes (all)
  const seenCamaraVotes = new Set();
  for (const v of camaraVotes) {
    const depId = String(v.deputy_id || v.legislator_id || v.legislator_external_id || '');
    const cleanId = depId.replace('camara-deputado-', '').replace('camara:', '');
    const tseId = v.candidate_tse_id || deputyToTse.get(depId) || deputyToTse.get(cleanId);
    if (!tseId) continue;

    const eventId = String(v.event_external_id || v.voting_event_external_id || v.voting_event_id || v.event_id || '');
    const cleanEventId = eventId.replace('voting_events:camara:', '');
    const rawNum = cleanEventId.replace('camara-votacao-', '');

    const dedupKey = `${tseId}|${cleanEventId}|${v.value}`;
    if (eventId && seenCamaraVotes.has(dedupKey)) continue;
    if (eventId) seenCamaraVotes.add(dedupKey);

    const m = camaraMeta[rawNum] || camaraMeta[cleanEventId];
    const mPropNum = m?.propNum || '';
    const mDesc = m?.desc || '';

    const gab = gabarito.propositions.find(
      (p) =>
        p.house === 'camara' &&
        (p.official_source_label?.includes(rawNum) ||
         p.official_source_url?.includes(rawNum) ||
         (p.proposition_id.includes('plp-41') && cleanEventId.includes('2606313-36')) ||
         (p.proposition_id.includes('plp-230') && cleanEventId.includes('2580259-24')) ||
         (p.proposition_id.includes('pec-6') && cleanEventId.includes('9002')) ||
         (p.proposition_id.includes('pl-490') && cleanEventId.includes('490')) ||
         (p.proposition_id.includes('pl-3626') && cleanEventId.includes('3626')) ||
         (p.proposition_id.includes('mpv-1323') && cleanEventId.includes('2581700')) ||
         (p.proposition_id.includes('pl-4566') && cleanEventId.includes('4566')))
    );

    let propTitle = gab?.title || v.proposition_title || mDesc;
    if (!propTitle) {
      if (cleanEventId.includes('2606313-36'))
        propTitle = 'Política Nacional de Prevenção e Enfrentamento da Violência contra Mulheres (PLP 41/2024)';
      else if (cleanEventId.includes('2580259-24'))
        propTitle = 'Conectividade de escolas públicas e regime do FUST (PLP 230/2025)';
      else propTitle = `Votação Nominal na Câmara dos Deputados (${cleanEventId.replace('camara-votacao-', '')})`;
    }

    const propNumber = gab?.number
      ? `${gab.type?.toUpperCase()} ${gab.number}/${gab.year}`
      : mPropNum || (cleanEventId.startsWith('camara-votacao-') ? cleanEventId.replace('camara-votacao-', 'Votação ') : cleanEventId || 'Votação Câmara');

    const assessment = gab?.assessments?.[0];
    const isScoreEligible = gab && assessment && assessment.score_eligible !== false && assessment.event_defending_vote !== null && (assessment.event_defending_vote || assessment.defending_vote);

    addCandidateVote(tseId, {
      house: 'camara',
      proposition_id: propNumber,
      title: propTitle,
      vote_value: v.value,
      date: v.recorded_at ? v.recorded_at.split('T')[0] : (m?.data ? m.data.split('T')[0] : '2025/2026'),
      source_url: gab?.official_source_url || `https://dadosabertos.camara.leg.br/api/v2/votacoes/${rawNum}`,
      source_label: gab?.official_source_label || 'Câmara dos Deputados — Dados Abertos',
      assessment_group: assessment?.group ?? null,
      impact_direction: assessment?.impact_direction ?? null,
      defending_vote: assessment?.defending_vote ?? null,
      event_defending_vote: assessment?.event_defending_vote ?? null,
      textual_defending_vote: assessment?.textual_defending_vote ?? null,
      score_eligible: isScoreEligible ? true : false,
      vote_attribution_status: assessment?.vote_attribution_status ?? (gab ? 'isolated' : null),
      severity: gab?.severity || 3,
      structural_type: gab?.structural_type || 'structural',
      confidence: assessment?.confidence || 0.95,
    });
  }

  const compactPayload = { p: propsList, c: candVotesMap };
  fs.writeFileSync(nominalVotesPath, JSON.stringify(compactPayload) + '\n');
  console.log(`✅ Base de votos nominais detalhados ultra-compacta atualizada: ${Object.keys(candVotesMap).length} candidatos, ${propsList.length} proposições (${(JSON.stringify(compactPayload).length / 1024).toFixed(1)} KB).`);

  // 3. Update public-candidates.json voting profiles and category_scores
  const { alrsProfiles, camaraProfiles } = buildProfilesByTse(root);
  let updatedCandidatesCount = 0;
  let updatedScoresCount = 0;

  for (const cand of publicCandidates) {
    const profiles = [];
    const tseId = cand.tse_candidate_id;

    if (tseId && alrsProfiles.has(tseId)) {
      profiles.push(alrsProfiles.get(tseId));
    }
    if (tseId && camaraProfiles.has(tseId)) {
      profiles.push(camaraProfiles.get(tseId));
    }

    if (profiles.length > 0) {
      cand.voting_profiles = profiles;
      updatedCandidatesCount++;
    }

    // Dynamic derivation of category_scores from candVotesMap (STRICT score_eligible check)
    const candVotes = candVotesMap[tseId] || [];
    const byGroup = new Map();

    for (const item of candVotes) {
      const prop = propsList[item[0]];
      if (!prop || !prop.g || !prop.d) continue;
      if (prop.score_eligible === false) continue; // Enforce fail-closed score rule

      const group = prop.g;
      const voteVal = (item[1] || '').toLowerCase();
      const impactDir = (prop.d || '').toLowerCase();

      const defending = prop.event_defending_vote || prop.defending_vote;
      if (!defending) continue; // No score without defending vote

      let alignment = 0;
      if (voteVal === defending) alignment = 1;
      else if (voteVal === 'ausente') alignment = -0.5;
      else if (voteVal === 'abstencao' || voteVal === 'obstrucao') alignment = 0;
      else alignment = -1;

      const bucket = byGroup.get(group) || [];
      bucket.push({ propId: prop.p, voteVal, impactDir, alignment });
      byGroup.set(group, bucket);
    }

    const computedScores = [];
    for (const [group, items] of byGroup.entries()) {
      const uniqueProps = [...new Map(items.map((it) => [it.propId, it])).values()];
      const count = uniqueProps.length;
      if (count === 0) continue;

      const favorable = uniqueProps.filter((it) => it.alignment > 0).length;
      const unfavorable = uniqueProps.filter((it) => it.alignment < 0).length;
      const totalAlign = uniqueProps.reduce((acc, it) => acc + it.alignment, 0);
      const scoreVal = Number((totalAlign / count).toFixed(2));

      computedScores.push({
        group,
        score: scoreVal,
        evaluated_propositions_count: count,
        divergences_count: unfavorable,
        favorable_votes: favorable,
        unfavorable_votes: unfavorable,
      });
    }

    cand.category_scores = computedScores;
    if (computedScores.length > 0) {
      updatedScoresCount++;
    }
  }

  fs.writeFileSync(publicCandPath, JSON.stringify(publicCandidates, null, 2) + '\n');
  console.log(`✅ Perfil de votações atualizado no snapshot público para ${updatedCandidatesCount} candidatos.`);
  console.log(`✅ Category scores atualizados no snapshot público para ${updatedScoresCount} candidatos com votos avaliados.`);
}

if (process.argv[1]?.endsWith('reconcile-all-alrs-and-federal-candidate-profiles.mjs')) {
  runFullReconciliation();
}
