import { BENEFICIARY_GROUPS } from "./contract";

export type BeneficiaryGroupSlug = (typeof BENEFICIARY_GROUPS)[number];

export const BENEFICIARY_GROUP_LABELS: Record<BeneficiaryGroupSlug | string, string> = {
  povos_indigenas: "Povos indígenas",
  comunidades_quilombolas: "Comunidades quilombolas",
  populacao_negra_periferica: "População negra periférica",
  mulheres: "Mulheres",
  lgbtqia: "Pessoas LGBTQIA+",
  pessoas_com_deficiencia: "Pessoas com deficiência",
  populacao_rua: "População em situação de rua",
  populacao_carceraria: "População carcerária / sistema prisional",
  criancas_adolescentes_vulnerabilidade: "Crianças e adolescentes em vulnerabilidade",
  pessoas_idosas_dependentes: "Pessoas idosas dependentes",
  trabalhadores_informais: "Trabalhadores informais e de aplicativo",
  agricultura_familiar_sem_terra: "Agricultura familiar, assentados e sem-terra",
  povos_de_terreiro: "Povos de terreiro / religiões de matriz africana",
  imigrantes_refugiados: "Imigrantes e refugiados",
};

export const BENEFICIARY_GROUPS_CANONICAL_ORDER: readonly BeneficiaryGroupSlug[] = [
  "mulheres",
  "povos_indigenas",
  "comunidades_quilombolas",
  "populacao_negra_periferica",
  "lgbtqia",
  "pessoas_com_deficiencia",
  "populacao_rua",
  "populacao_carceraria",
  "criancas_adolescentes_vulnerabilidade",
  "pessoas_idosas_dependentes",
  "trabalhadores_informais",
  "agricultura_familiar_sem_terra",
  "povos_de_terreiro",
  "imigrantes_refugiados",
];

export function getBeneficiaryGroupLabel(slug: string): string {
  return BENEFICIARY_GROUP_LABELS[slug] ?? String(slug ?? "").replaceAll("_", " ");
}
