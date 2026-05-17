import { describe, it, expect } from "vitest";

import {
  computeWolterScore,
  computeCommitScore,
  computePullRequestScore,
  computeQualityScore,
  computeReviewScore,
  computeBugFixScore,
  scoreClassification,
  defaultWolterConfig,
  type WolterInput,
} from "./wolter";

const baseInput: WolterInput = {
  commitCount: 20,
  activeDays: 14,
  totalDays: 30,
  avgLinesPerCommit: 100,
  prOpened: 10,
  prMerged: 8,
  avgCycleTimeHours: 24,
  reopenedIssues: 1,
  totalIssues: 10,
  reviewsPerformed: 5,
  teamAvgReviews: 5,
  bugFixTimeHours: 10,
  totalDevTimeHours: 50,
};

describe("computeWolterScore", () => {
  it("deve retornar score entre 0 e 100 para input base", () => {
    const result = computeWolterScore(baseInput);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("deve retornar score 0 quando todos os componentes sao null", () => {
    const empty: WolterInput = {
      commitCount: 0,
      activeDays: 0,
      totalDays: 0,
      avgLinesPerCommit: 0,
      prOpened: 0,
      prMerged: 0,
      avgCycleTimeHours: null,
      reopenedIssues: 0,
      totalIssues: 0,
      reviewsPerformed: 0,
      teamAvgReviews: 0,
      bugFixTimeHours: 0,
      totalDevTimeHours: 0,
    };
    const result = computeWolterScore(empty);
    expect(result.score).toBe(0);
  });

  it("deve redistribuir pesos quando componente R eh null", () => {
    const input: WolterInput = { ...baseInput, teamAvgReviews: 0 };
    const result = computeWolterScore(input);
    expect(result.r).toBeNull();
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe("scoreClassification", () => {
  it("deve classificar 85 como Alta", () => {
    expect(scoreClassification(85)).toBe("Alta");
  });

  it("deve classificar 65 como Boa", () => {
    expect(scoreClassification(65)).toBe("Boa");
  });

  it("deve classificar 50 como Moderada", () => {
    expect(scoreClassification(50)).toBe("Moderada");
  });

  it("deve classificar 25 como Baixa", () => {
    expect(scoreClassification(25)).toBe("Baixa");
  });

  it("deve classificar exatamente 80 como Alta", () => {
    expect(scoreClassification(80)).toBe("Alta");
  });
});
