import fs from 'node:fs';
import path from 'node:path';
import { loadAllCamaraVotes, buildDeputyToTseMapping } from './enrich-candidate-voting-profiles.mjs';

function classifyText(title, desc) {
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
    text.includes('colo do útero')
  ) {
    return {
      group: 'mulheres',
      direction: 'positive',
      defending_vote: 'sim',
      severity: text.includes('feminicídio') || text.includes('violência') ? 4 : 3,
      type: 'structural',
      confidence: 0.95,
      rationale:
        'Legislação voltada à ampliação da proteção, amparo e direitos das mulheres no Estado do RS.',
    };
  }

  // 2. Servidores Públicos e Segurança Pública
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
    text.includes('polícia civil') ||
    text.includes('brigada militar') ||
    text.includes('bombeiro') ||
    text.includes('perito') ||
    text.includes('policial') ||
    text.includes('estatuto')
  ) {
    return {
      group: 'servidores_publicos',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: text.includes('reajuste') || text.includes('subsídio') ? 'budgetary' : 'structural',
      confidence: 0.92,
      rationale:
        'Norma regulamentadora de direitos, valorização, remuneração e estruturação das carreiras do serviço público e segurança estadual.',
    };
  }

  // 3. Crianças e Adolescentes em Vulnerabilidade
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
    text.includes('juventude')
  ) {
    return {
      group: 'criancas_adolescentes_vulnerabilidade',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 4,
      type: 'structural',
      confidence: 0.95,
      rationale:
        'Política pública de proteção integral, amparo social e prevenção à violência contra crianças e jovens.',
    };
  }

  // 4. Pessoas com Deficiência e Condições Crônicas
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
    text.includes('doença rara')
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

  // 5. Saúde e Usuários do SUS
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
    text.includes('atendimento médico')
  ) {
    return {
      group: 'saude_usuarios_sus',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'budgetary',
      confidence: 0.9,
      rationale:
        'Fortalecimento do sistema público de saúde, assistência farmacêutica e ampliação da rede de atendimento do SUS.',
    };
  }

  // 6. Educação e Estudantes
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
    text.includes('pedagógico') ||
    text.includes('alfabetização') ||
    text.includes('livro') ||
    text.includes('biblioteca')
  ) {
    return {
      group: 'educacao_estudantes',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.9,
      rationale:
        'Fomento à educação pública, acesso estudantil, transporte escolar e infraestrutura da rede de ensino.',
    };
  }

  // 7. Meio Ambiente e Clima
  if (
    text.includes('meio ambiente') ||
    text.includes('clima') ||
    text.includes('enchente') ||
    text.includes('calamidade') ||
    text.includes('recursos hídricos') ||
    text.includes('bacia hidrográfica') ||
    text.includes('florestal') ||
    text.includes('resíduos sólidos') ||
    text.includes('saneamento') ||
    text.includes('proteção animal') ||
    text.includes('fauna') ||
    text.includes('flora') ||
    text.includes('rio') ||
    text.includes('água') ||
    text.includes('desastre') ||
    text.includes('reciclagem')
  ) {
    return {
      group: 'meio_ambiente_clima',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 4,
      type: 'structural',
      confidence: 0.9,
      rationale:
        'Medidas de conservação ambiental, resiliência climática, prevenção a cheias e proteção de recursos hídricos e fauna.',
    };
  }

  // 8. Agricultores Familiares e Meio Rural
  if (
    text.includes('agricultura familiar') ||
    text.includes('pequeno produtor') ||
    text.includes('rural') ||
    text.includes('estiagem') ||
    text.includes('irrigação') ||
    text.includes('assentamento') ||
    text.includes('crédito rural') ||
    text.includes('sementes') ||
    text.includes('agropecuária') ||
    text.includes('pesca') ||
    text.includes('colono') ||
    text.includes('safra')
  ) {
    return {
      group: 'agricultores_familiares',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.88,
      rationale:
        'Fomento à produção rural familiar, assistência técnica e enfrentamento de perdas por estiagem no campo.',
    };
  }

  // 9. Micro e Pequenos Empreendedores
  if (
    text.includes('microempresa') ||
    text.includes('pequeno porte') ||
    text.includes('mei') ||
    text.includes('empreendedorismo') ||
    text.includes('desburocratização') ||
    text.includes('simples gaúcho') ||
    text.includes('microcrédito') ||
    text.includes('comércio') ||
    text.includes('inovação') ||
    text.includes('startup') ||
    text.includes('cooperativa')
  ) {
    return {
      group: 'micro_pequenos_empreendedores',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 2,
      type: 'structural',
      confidence: 0.88,
      rationale:
        'Incentivo e facilitação de crédito, regime simplificado e apoio a pequenos empreendimentos e cooperativas locais.',
    };
  }

  // 10. Idosos
  if (
    text.includes('idoso') ||
    text.includes('terceira idade') ||
    text.includes('envelhecimento') ||
    text.includes('estatuto do idoso') ||
    text.includes('asilo') ||
    text.includes('ilpi')
  ) {
    return {
      group: 'idosos',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.92,
      rationale:
        'Proteção, assistência integral e garantia de prioridade e dignidade à população idosa.',
    };
  }

  // 11. População Negra e Periférica
  if (
    text.includes('população negra') ||
    text.includes('igualdade racial') ||
    text.includes('periferia') ||
    text.includes('quilombola') ||
    text.includes('antirracista') ||
    text.includes('comunidade carente') ||
    text.includes('habitação popular') ||
    text.includes('moradia')
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

  // 12. Povos Indígenas e Comunidades Tradicionais
  if (
    text.includes('indígena') ||
    text.includes('aldeia') ||
    text.includes('guarani') ||
    text.includes('kaingang') ||
    text.includes('tradicionais') ||
    text.includes('povo originário')
  ) {
    return {
      group: 'povos_indigenas_comunidades_tradicionais',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.9,
      rationale:
        'Defesa dos direitos territoriais, saúde indígena e salvaguarda das tradições culturais originárias.',
    };
  }

  // 13. LGBTQIA+
  if (
    text.includes('lgbt') ||
    text.includes('diversidade sexual') ||
    text.includes('identidade de gênero') ||
    text.includes('homofobia') ||
    text.includes('transfobia') ||
    text.includes('nome social')
  ) {
    return {
      group: 'lgbtqia',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 3,
      type: 'structural',
      confidence: 0.9,
      rationale:
        'Garantia de direitos civis, cidadania e combate à discriminação por orientação sexual e identidade de gênero.',
    };
  }

  // 14. Trabalhadores Informais e Autônomos
  if (
    text.includes('trabalhador informal') ||
    text.includes('autônomo') ||
    text.includes('ambulante') ||
    text.includes('catador') ||
    text.includes('reciclador') ||
    text.includes('motorista de aplicativo') ||
    text.includes('entregador') ||
    text.includes('artesão') ||
    text.includes('feirante')
  ) {
    return {
      group: 'trabalhadores_informais',
      direction: 'positive',
      defending_vote: 'sim',
      severity: 2,
      type: 'structural',
      confidence: 0.88,
      rationale:
        'Amparo e inclusão socioprodutiva para categorias de trabalho autônomo, artesanato e feirantes.',
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

  const recon = JSON.parse(fs.readFileSync(reconPath, 'utf8'));
  const subQueue = JSON.parse(fs.readFileSync(subQueuePath, 'utf8'));
  const gabarito = JSON.parse(fs.readFileSync(gabaritoPath, 'utf8'));
  const publicCandidates = JSON.parse(fs.readFileSync(publicCandPath, 'utf8'));
  const camaraVotes = loadAllCamaraVotes(root);
  const deputyToTse = buildDeputyToTseMapping(root);

  // 1. Process substantive ALRS queue into canonical gabarito
  const subMap = new Map();
  for (const item of subQueue.items || []) {
    subMap.set(item.proposition_version_id, item);
    const classification = classifyText(item.title, item.official_event_description);
    if (classification) {
      const propId = `alrs:${(item.official_event_description || item.title || '').slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const existing = gabarito.propositions.find(
        (p) => p.proposition_id === propId || (p.title && item.title && p.title.slice(0, 30) === item.title.slice(0, 30))
      );
      if (!existing) {
        gabarito.propositions.push({
          proposition_id: propId,
          house: 'alrs',
          type: 'pl',
          number: String(item.items_count || 1),
          year: 2026,
          title: item.title,
          official_source_url: item.source_urls?.[0] || 'https://transparencia.al.rs.gov.br/parlamentares/votos-plenario',
          official_source_label: item.official_event_description || 'ALRS Sistema Legis',
          severity: classification.severity,
          structural_type: classification.type,
          review_status: 'approved',
          assessments: [
            {
              group: classification.group,
              impact_direction: classification.direction,
              defending_vote: classification.defending_vote,
              confidence: classification.confidence,
              rationale: classification.rationale,
              sources: item.source_urls?.length ? item.source_urls.slice(0, 3) : ['https://transparencia.al.rs.gov.br/parlamentares/votos-plenario'],
            },
          ],
        });
      }
    }
  }

  gabarito.updated_at = new Date().toISOString();
  fs.writeFileSync(gabaritoPath, JSON.stringify(gabarito, null, 2) + '\n');
  console.log(`✅ Matriz Canônica Universal atualizada: ${gabarito.propositions.length} proposições ativas.`);

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
      const classification = subItem ? classifyText(subItem.title, subItem.official_event_description) : classifyText(title, '');

      addCandidateVote(tseId, {
        house: 'alrs',
        proposition_id: `${r.proposition_type?.toUpperCase() || 'PROP'} ${r.proposition_number || ''}/${r.proposition_year || ''}`,
        title: title,
        vote_value: r.value,
        date: r.occurred_at ? r.occurred_at.split(' ')[0] : '2026',
        source_url: r.source_url || 'https://transparencia.al.rs.gov.br/parlamentares/votos-plenario',
        source_label: 'ALRS Portal da Transparência',
        assessment_group: classification?.group ?? null,
        impact_direction: classification?.direction ?? null,
      });
    }
  }

  // Camara votes (all)
  for (const v of camaraVotes) {
    const depId = String(v.deputy_id || v.legislator_id || v.legislator_external_id || '');
    const cleanId = depId.replace('camara-deputado-', '').replace('camara:', '');
    const tseId = deputyToTse.get(depId) || deputyToTse.get(cleanId);
    if (!tseId) continue;

    const eventId = String(v.voting_event_external_id || v.voting_event_id || v.event_id || '');
    const cleanEventId = eventId.replace('voting_events:camara:', '');
    const rawNum = cleanEventId.replace('camara-votacao-', '');

    const gab = gabarito.propositions.find(
      (p) =>
        p.official_source_label?.includes(rawNum) ||
        p.official_source_url?.includes(rawNum) ||
        (p.proposition_id.includes('plp-41') && cleanEventId.includes('2606313-36')) ||
        (p.proposition_id.includes('mpv-1313') && cleanEventId.includes('2557414')) ||
        (p.proposition_id.includes('mpv-1323') && cleanEventId.includes('2581700'))
    );

    let propTitle = gab?.title || v.proposition_title;
    if (!propTitle) {
      if (cleanEventId.includes('2606313-36'))
        propTitle = 'Política Nacional de Prevenção e Enfrentamento da Violência contra Mulheres (PLP 41/2024)';
      else if (cleanEventId.includes('2557414'))
        propTitle = 'Apoio e Fomento a Trabalhadores Autônomos e Informais (MPV 1313/2025)';
      else if (cleanEventId.includes('2581700'))
        propTitle = 'Crédito Produtivo e Amparo a Trabalhadores Informais (MPV 1323/2025)';
      else if (cleanEventId.includes('2503998-70')) propTitle = 'Requerimento de Retirada de Pauta do PLP 109';
      else if (cleanEventId.includes('2503998-75')) propTitle = 'Emenda Fiscal ao PLP 109';
      else if (cleanEventId.includes('2562289-8')) propTitle = 'Requerimento de Urgência para o PLP 104';
      else if (cleanEventId.includes('2610579-7')) propTitle = 'Requerimento de Urgência para o PL 2898';
      else if (cleanEventId.includes('2638483-34')) propTitle = 'Emenda ao PL 3085';
      else if (cleanEventId.includes('2562173')) propTitle = 'Votação do PL 2630 (Regulação de Plataformas)';
      else if (cleanEventId.includes('2618177')) propTitle = 'Votação do PLP 114';
      else propTitle = `Votação Nominal na Câmara dos Deputados (${cleanEventId.replace('camara-votacao-', '')})`;
    }

    addCandidateVote(tseId, {
      house: 'camara',
      proposition_id: gab?.number
        ? `${gab.type?.toUpperCase()} ${gab.number}/${gab.year}`
        : cleanEventId.startsWith('camara-votacao-')
        ? cleanEventId.replace('camara-votacao-', 'Votação ')
        : cleanEventId || 'Votação Câmara',
      title: propTitle,
      vote_value: v.value,
      date: v.recorded_at ? v.recorded_at.split('T')[0] : v.date || '2025/2026',
      source_url: gab?.official_source_url || `https://dadosabertos.camara.leg.br/api/v2/votacoes/${rawNum}`,
      source_label: gab?.official_source_label || 'Câmara dos Deputados — Dados Abertos',
      assessment_group: gab?.assessments?.[0]?.group ?? null,
      impact_direction: gab?.assessments?.[0]?.impact_direction ?? null,
    });
  }

  const compactPayload = { p: propsList, c: candVotesMap };
  fs.writeFileSync(nominalVotesPath, JSON.stringify(compactPayload) + '\n');
  console.log(`✅ Base de votos nominais detalhados ultra-compacta atualizada: ${Object.keys(candVotesMap).length} candidatos, ${propsList.length} proposições (${(JSON.stringify(compactPayload).length / 1024).toFixed(1)} KB).`);

  // 3. Update public-candidates.json voting profiles
  let updatedCandidatesCount = 0;
  for (const cand of publicCandidates) {
    const rawAlrsList = alrsVotesByCand.get(cand.tse_candidate_id) || [];
    const camaraList = camaraVotes.filter((v) => {
      const depId = String(v.deputy_id || v.legislator_id || v.legislator_external_id || '');
      const cleanId = depId.replace('camara-deputado-', '').replace('camara:', '');
      return deputyToTse.get(depId) === cand.tse_candidate_id || deputyToTse.get(cleanId) === cand.tse_candidate_id;
    });

    const profiles = [];
    if (rawAlrsList.length > 0) {
      const sim = rawAlrsList.filter((v) => v.value.toLowerCase() === 'sim').length;
      const nao = rawAlrsList.filter((v) => v.value.toLowerCase() === 'nao').length;
      const abst = rawAlrsList.filter((v) => v.value.toLowerCase() === 'abstencao').length;
      const aus = rawAlrsList.filter((v) => v.value.toLowerCase() === 'ausente').length;
      const obs = rawAlrsList.filter((v) => v.value.toLowerCase() === 'obstrucao').length;
      profiles.push({
        house: 'alrs',
        total_votes: rawAlrsList.length,
        votos_sim: sim,
        votos_nao: nao,
        votos_abstencao: abst,
        votos_ausente: aus,
        votos_obstrucao: obs,
        nominal_balance: sim - nao,
      });
    }

    if (camaraList.length > 0) {
      const sim = camaraList.filter((v) => v.value.toLowerCase() === 'sim').length;
      const nao = camaraList.filter((v) => v.value.toLowerCase() === 'nao').length;
      const abst = camaraList.filter((v) => v.value.toLowerCase() === 'abstencao').length;
      const aus = camaraList.filter((v) => v.value.toLowerCase() === 'ausente').length;
      const obs = camaraList.filter((v) => v.value.toLowerCase() === 'obstrucao').length;
      profiles.push({
        house: 'camara',
        total_votes: camaraList.length,
        votos_sim: sim,
        votos_nao: nao,
        votos_abstencao: abst,
        votos_ausente: aus,
        votos_obstrucao: obs,
        nominal_balance: sim - nao,
      });
    }

    if (profiles.length > 0) {
      cand.voting_profiles = profiles;
      updatedCandidatesCount++;
    }
  }

  fs.writeFileSync(publicCandPath, JSON.stringify(publicCandidates, null, 2) + '\n');
  console.log(`✅ Perfil de votações atualizado no snapshot público para ${updatedCandidatesCount} candidatos.`);
}

runFullReconciliation();
