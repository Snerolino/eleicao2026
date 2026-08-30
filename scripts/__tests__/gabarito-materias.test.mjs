// @vitest-environment node

import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const gabaritoPath = resolve(root, "data/impact-matrices/gabarito-materias-aprovadas.json");

describe("Matriz Gabarito de Proposições Aprovadas", () => {
  it("arquivo gabarito-materias-aprovadas.json existe e é válido", () => {
    expect(existsSync(gabaritoPath)).toBe(true);
    const content = JSON.parse(readFileSync(gabaritoPath, "utf8"));
    expect(content.schema_version).toMatch(/^[0-9]+\.[0-9]+\.[0-9]+$/);
    expect(content.methodology_version).toMatch(/^[0-9]+\.[0-9]+\.[0-9]+$/);
    expect(Array.isArray(content.propositions)).toBe(true);
    expect(content.propositions.length).toBeGreaterThanOrEqual(1);
  });

  it("todas as proposições possuem campos obrigatórios e IDs únicos", () => {
    const content = JSON.parse(readFileSync(gabaritoPath, "utf8"));
    const seenIds = new Set();

    for (const prop of content.propositions) {
      expect(prop.proposition_id).toBeDefined();
      expect(seenIds.has(prop.proposition_id)).toBe(false);
      seenIds.add(prop.proposition_id);

      expect(["alrs", "camara", "senado"]).toContain(prop.house);
      expect(typeof prop.title).toBe("string");
      expect(prop.title.length).toBeGreaterThan(5);
      expect(prop.severity).toBeGreaterThanOrEqual(1);
      expect(prop.severity).toBeLessThanOrEqual(5);
      expect(["structural", "budgetary", "symbolic"]).toContain(prop.structural_type);
      expect(prop.review_status).toBe("approved");

      expect(Array.isArray(prop.assessments)).toBe(true);
      expect(prop.assessments.length).toBeGreaterThan(0);

      for (const assessment of prop.assessments) {
        expect(typeof assessment.group).toBe("string");
        expect(["positive", "negative", "mixed", "unclear"]).toContain(assessment.impact_direction);

        if (assessment.impact_direction === "positive" || assessment.impact_direction === "negative") {
          expect(["sim", "nao", null]).toContain(assessment.defending_vote);
        } else if (assessment.impact_direction === "unclear") {
          expect(assessment.defending_vote).toBeNull();
        }

        expect(assessment.confidence).toBeGreaterThan(0);
        expect(assessment.confidence).toBeLessThanOrEqual(1);
        expect(assessment.rationale.length).toBeGreaterThanOrEqual(20);
        expect(Array.isArray(assessment.sources)).toBe(true);
        expect(assessment.sources.length).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
