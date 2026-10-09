import { describe, it, expect } from "vitest";
import {
  blockRewardAtHeight,
  nextHalvingHeight,
  halvingCountdown,
  transactionFee,
  blockFillPercent,
  averageFeePerTx,
  fearGreedZone,
  mean,
} from "../CryptoNetworkMath";

describe("halving schedule", () => {
  it("halves the 50 BTC subsidy every 210,000 blocks", () => {
    expect(blockRewardAtHeight(0)).toBe(50);
    expect(blockRewardAtHeight(209_999)).toBe(50);
    expect(blockRewardAtHeight(210_000)).toBe(25);
    expect(blockRewardAtHeight(840_000)).toBe(3.125);
    expect(blockRewardAtHeight(1_050_000)).toBe(1.5625);
    expect(blockRewardAtHeight(64 * 210_000)).toBe(0);
  });

  it("finds the next halving height", () => {
    expect(nextHalvingHeight(970_667)).toBe(1_050_000);
    expect(nextHalvingHeight(840_000)).toBe(1_050_000);
  });

  it("counts down using the measured block spacing", () => {
    const c = halvingCountdown(1_049_990, 1_000, 500);
    expect(c.blocksRemaining).toBe(10);
    expect(c.secondsRemaining).toBe(5_000);
    expect(c.estimatedTime).toBe(6_000);
    expect(c.currentReward).toBe(3.125);
    expect(c.nextReward).toBe(1.5625);
    expect(c.eraProgress).toBeCloseTo((209_990 / 210_000) * 100);
    expect(halvingCountdown(1_049_990, 0, 0).secondsRemaining).toBe(6_000);
  });
});

describe("fees and blocks", () => {
  it("prices a transaction in sats, BTC and USD", () => {
    const fee = transactionFee(10, 141, 80_000);
    expect(fee.sats).toBe(1410);
    expect(fee.btc).toBeCloseTo(0.0000141, 10);
    expect(fee.usd).toBeCloseTo(1.128, 6);
  });

  it("measures block fill and average fee per paying transaction", () => {
    expect(blockFillPercent(3_996_000)).toBeCloseTo(99.9);
    expect(blockFillPercent(5_000_000)).toBe(100);
    expect(blockFillPercent(0)).toBe(0);
    expect(averageFeePerTx(10_000, 11)).toBe(1_000);
    expect(averageFeePerTx(0, 1)).toBe(0);
  });
});

describe("fearGreedZone / mean", () => {
  it("maps values to alternative.me bands", () => {
    expect(fearGreedZone(0)).toBe("extremeFear");
    expect(fearGreedZone(24)).toBe("extremeFear");
    expect(fearGreedZone(25)).toBe("fear");
    expect(fearGreedZone(50)).toBe("neutral");
    expect(fearGreedZone(59)).toBe("greed");
    expect(fearGreedZone(100)).toBe("extremeGreed");
  });

  it("averages", () => {
    expect(mean([1, 2, 3])).toBe(2);
    expect(mean([])).toBe(0);
  });
});
