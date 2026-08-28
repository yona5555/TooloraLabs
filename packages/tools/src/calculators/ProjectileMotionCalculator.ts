import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type ProjectileMotionCalculatorInput = {
  speed: number;
  angle: number;
  height: number;
  gravity: number;
};

export type ProjectileMotionCalculatorError = "invalid-gravity" | "invalid-speed" | "invalid-height";

export type ProjectileMotionCalculatorOutput = {
  error: ProjectileMotionCalculatorError | null;
  timeOfFlight: number;
  maxHeight: number;
  range: number;
  impactSpeed: number;
  impactAngle: number;
};

const DEG_TO_RAD = Math.PI / 180;

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

export class ProjectileMotionCalculator extends BaseCalculator<ProjectileMotionCalculatorInput, ProjectileMotionCalculatorOutput> {
  metadata = {
    id: "projectile-motion-calculator",
    slug: "projectile-motion-calculator",
    name: "Projectile Motion Calculator",
    category: "math-science",
    description:
      "Compute time of flight, maximum height, range, and impact velocity for a projectile launched at an angle under uniform gravity, with no air resistance.",
    version: "1.0.0",
  };

  execute(input: ProjectileMotionCalculatorInput, _context: ToolContext): ToolResult<ProjectileMotionCalculatorOutput> {
    const { speed, angle, height, gravity } = input;

    if (gravity <= 0) return this.errorResult("invalid-gravity");
    if (speed < 0) return this.errorResult("invalid-speed");
    if (height < 0) return this.errorResult("invalid-height");

    const angleRad = angle * DEG_TO_RAD;
    const vx = speed * Math.cos(angleRad);
    const vy = speed * Math.sin(angleRad);

    // Time of flight: solve h0 + vy*t - 0.5*g*t^2 = 0 for the positive root.
    // 0.5*g*t^2 - vy*t - h0 = 0 => t = [vy + sqrt(vy^2 + 2*g*h0)] / g
    const discriminant = vy * vy + 2 * gravity * height;
    const timeOfFlight = (vy + Math.sqrt(Math.max(0, discriminant))) / gravity;

    // Max height above the ground (launch height + rise from vertical velocity).
    const maxHeight = height + (vy * vy) / (2 * gravity);

    const range = vx * timeOfFlight;

    const vyAtImpact = vy - gravity * timeOfFlight;
    const impactSpeed = Math.sqrt(vx * vx + vyAtImpact * vyAtImpact);
    const impactAngle = (Math.atan2(-vyAtImpact, vx) * 180) / Math.PI;

    return this.ok({
      timeOfFlight,
      maxHeight,
      range,
      impactSpeed,
      impactAngle,
    });
  }

  private ok(data: Omit<ProjectileMotionCalculatorOutput, "error">): ToolResult<ProjectileMotionCalculatorOutput> {
    return {
      success: true,
      data: {
        error: null,
        timeOfFlight: clean(data.timeOfFlight),
        maxHeight: clean(data.maxHeight),
        range: clean(data.range),
        impactSpeed: clean(data.impactSpeed),
        impactAngle: clean(data.impactAngle),
      },
      metadata: {},
    };
  }

  private errorResult(error: ProjectileMotionCalculatorError): ToolResult<ProjectileMotionCalculatorOutput> {
    return {
      success: true,
      data: { error, timeOfFlight: 0, maxHeight: 0, range: 0, impactSpeed: 0, impactAngle: 0 },
      metadata: {},
    };
  }
}
