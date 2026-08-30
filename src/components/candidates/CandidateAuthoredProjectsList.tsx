import { useMemo, useState } from 'react';
import { sanitizeUrl } from '@/utils/sanitizeUrl';
import type { CandidateAuthoredProject, CandidateAuthoredProjectStatus } from '@/types/election';

export interface CandidateAuthoredProjectsListProps {
  projects: CandidateAuthoredProject[];
}

const STATUS_LABELS: Record<CandidateAuthoredProjectStatus, string> = {
  tramitando: 'Tramitando',
  aprovado: 'Aprovado',
  arquivado: 'Arquivado',
  vetado: 'Vetado',
  transformado_em_lei: 'Transformado em lei',
};

const ROLE_LABELS = {
  autor_principal: 'Autor principal',
  coautor: 'Coautor',
  relator: 'Relator',
} as const;

const HOUSE_LABELS = {
  alrs: 'ALRS',
  camara: 'Câmara',
  senado: 'Senado',
} as const;

export function CandidateAuthoredProjectsList({ projects }: CandidateAuthoredProjectsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [status, setStatus] = useState<'all' | CandidateAuthoredProjectStatus>('all');
  const [topic, setTopic] = useState('all');
  const [search, setSearch] = useState('');

  const topics = useMemo(
    () => [...new Set(projects.map((project) => project.main_topic).filter(Boolean))].sort(),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = status === 'all' || project.status === status;
      const matchesTopic = topic === 'all' || project.main_topic === topic;
      const haystack = [
        project.type,
        project.number,
        project.year.toString(),
        project.title,
        project.summary_short,
        project.summary_expanded,
        project.main_topic,
        project.role,
        project.status,
      ].join(' ').toLowerCase();
      return matchesStatus && matchesTopic && (!term || haystack.includes(term));
    });
  }, [projects, search, status, topic]);

  if (projects.length === 0) {
    return (
      <section aria-labelledby="authored-projects-heading" className="border-y border-[var(--color-border-editorial)] py-6">
        <h2 id="authored-projects-heading" className="text-2xl">Projetos de autoria (0)</h2>
        <p className="mt-2 font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">
          Nenhum projeto de autoria registrado com fonte oficial.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="authored-projects-heading" className="border-y-[3px] border-double border-[var(--color-ink)] py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted-ink)]">Atuação legislativa</p>
          <h2 id="authored-projects-heading" className="mt-1 text-3xl">Projetos de autoria ({projects.length})</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-ink)]">{filteredProjects.length} projeto(s) exibido(s), com autoria ou relatoria identificada em fonte oficial.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="Filtros de projetos de autoria">
        <label className="font-mono text-xs text-[var(--color-muted-ink)]">
          <span className="mb-1 block uppercase tracking-wide">Status</span>
          <select aria-label="Filtrar por status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 w-full border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 text-sm text-[var(--color-ink)]">
            <option value="all">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="font-mono text-xs text-[var(--color-muted-ink)]">
          <span className="mb-1 block uppercase tracking-wide">Tema</span>
          <select aria-label="Filtrar por tema" value={topic} onChange={(event) => setTopic(event.target.value)} className="min-h-11 w-full border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 text-sm text-[var(--color-ink)]">
            <option value="all">Todos os temas</option>
            {topics.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="font-mono text-xs text-[var(--color-muted-ink)]">
          <span className="mb-1 block uppercase tracking-wide">Busca</span>
          <input aria-label="Buscar projetos" role="searchbox" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Título, número ou resumo" className="min-h-11 w-full border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 text-sm text-[var(--color-ink)]" />
        </label>
      </div>

      {filteredProjects.length === 0 ? (
        <p className="mt-5 border border-[var(--color-border-editorial)] p-5 font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">Nenhum projeto encontrado com os filtros selecionados.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {filteredProjects.map((project) => {
            const isExpanded = expandedId === project.id;
            const panelId = `authored-project-${project.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
            const safeUrl = sanitizeUrl(project.official_url);
            return (
              <article key={project.id} className="border border-[var(--color-border-editorial)] bg-[var(--color-paper)]">
                <h3 className="m-0">
                  <button type="button" aria-expanded={isExpanded} aria-controls={panelId} onClick={() => setExpandedId(isExpanded ? null : project.id)} className="flex min-h-11 w-full flex-col gap-2 p-4 text-left hover:bg-[var(--color-surface-hover,rgba(0,0,0,0.02))] sm:flex-row sm:items-start sm:justify-between">
                    <span>
                      <span className="font-mono text-xs font-semibold text-[var(--color-muted-ink)]">{project.type} {project.number}/{project.year} · {HOUSE_LABELS[project.house]}</span>
                      <span className="mt-1 block text-lg font-medium">{project.title}</span>
                      <span className="mt-1 block text-sm text-[var(--color-muted-ink)]">{project.summary_short}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-[var(--color-institutional)]">{isExpanded ? 'Recolher' : 'Expandir'} <span aria-hidden="true">{isExpanded ? '⌃' : '⌄'}</span></span>
                  </button>
                </h3>
                {isExpanded && (
                  <div id={panelId} className="space-y-4 border-t border-[var(--color-border-editorial)] p-4">
                    <div className="flex flex-wrap gap-2 font-mono text-xs text-[var(--color-muted-ink)]">
                      <span className="border border-[var(--color-border-editorial)] px-2 py-1">{ROLE_LABELS[project.role]}</span>
                      <span className="border border-[var(--color-border-editorial)] px-2 py-1">{STATUS_LABELS[project.status]}</span>
                      <span className="border border-[var(--color-border-editorial)] px-2 py-1">Tema: {project.main_topic}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{project.summary_expanded}</p>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">Grupos populacionais relacionados</p>
                      <ul className="mt-2 flex flex-wrap gap-2 text-sm">{project.target_groups.map((group) => <li key={group} className="rounded-sm bg-[var(--color-institutional)]/10 px-2 py-1">{group}</li>)}</ul>
                    </div>
                    {safeUrl && <a href={safeUrl} target="_blank" rel="noreferrer noopener" aria-label={`Abrir projeto oficial ${project.type} ${project.number}/${project.year}`} className="inline-flex min-h-11 items-center gap-1 font-mono text-xs text-[var(--color-institutional)] underline underline-offset-4">Link oficial direto <span aria-hidden="true">↗</span></a>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
