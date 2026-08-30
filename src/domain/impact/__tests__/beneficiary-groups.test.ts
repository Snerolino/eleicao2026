import { describe, expect, it } from "vitest";
import { BENEFICIARY_GROUPS } from "../contract";
import {
  BENEFICIARY_GROUP_LABELS,
  BENEFICIARY_GROUPS_CANONICAL_ORDER,
  getBeneficiaryGroupLabel,
} from "../beneficiary-groups";

describe("beneficiary-groups domain", () => {
  it("contém rótulos para todos os 21 grupos canônicos da metodologia", () => {
    expect(BENEFICIARY_GROUPS).toHaveLength(21);
    for (const group of BENEFICIARY_GROUPS) {
      expect(BENEFICIARY_GROUP_LABELS[group]).toBeDefined();
      expect(typeof BENEFICIARY_GROUP_LABELS[group]).toBe("string");
      expect(BENEFICIARY_GROUP_LABELS[group].length).toBeGreaterThan(3);
    }
  });

  it("ordem canônica contém exatamente os 21 grupos sem duplicações", () => {
    expect(BENEFICIARY_GROUPS_CANONICAL_ORDER).toHaveLength(21);
    const unique = new Set(BENEFICIARY_GROUPS_CANONICAL_ORDER);
    expect(unique.size).toBe(21);
    for (const group of BENEFICIARY_GROUPS) {
      expect(unique.has(group)).toBe(true);
    }
  });

  it("getBeneficiaryGroupLabel retorna o rótulo oficial para slugs conhecidos e fallback formatado para outros", () => {
    expect(getBeneficiaryGroupLabel("mulheres")).toBe("Mulheres");
    expect(getBeneficiaryGroupLabel("povos_indigenas")).toBe("Povos indígenas");
    expect(getBeneficiaryGroupLabel("lgbtqia")).toBe("Pessoas LGBTQIA+");
    expect(getBeneficiaryGroupLabel("agricultura_familiar_sem_terra")).toBe(
      "Agricultura familiar, assentados e sem-terra"
    );
    expect(getBeneficiaryGroupLabel("grupo_desconhecido_teste")).toBe(
      "grupo desconhecido teste"
    );
  });
});
