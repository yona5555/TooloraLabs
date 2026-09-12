import { CloudLightning, Droplets, Flame, Snowflake, Waves, Wind } from "lucide-react";

export type DisasterItem = {
  name: string;
  definition: string;
  connection: string;
  example: string;
};

const ICONS = [Wind, Waves, Flame, Droplets, CloudLightning, Snowflake];

type WeatherDisastersProps = {
  intro: string;
  items: DisasterItem[];
};

/**
 * Educational overview only — deliberately built from `items` passed in as
 * plain data (no live feed, no location matching, no severity scoring) so
 * it can never be mistaken for an actual disaster-warning system. That
 * caveat lives in the page's single consolidated Notices section (per
 * TooloraLabs-Claude-Instructions.md's disclaimer-consolidation rule)
 * rather than repeated here. Rendered inside a parent InfoSection, which
 * already supplies the section's own heading — this component intentionally
 * has no heading of its own to avoid a duplicate title.
 */
export default function WeatherDisasters({ intro, items }: WeatherDisastersProps) {
  return (
    <div>
      <p>{intro}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={item.name} className="rounded-lg border border-current/15 p-4">
              <div className="flex items-center gap-2.5">
                <Icon size={18} className="shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <h4 className="font-semibold">{item.name}</h4>
              </div>
              <p className="mt-2 text-sm leading-6 opacity-90">{item.definition}</p>
              <p className="mt-2 text-sm leading-6 opacity-80">{item.connection}</p>
              <p className="mt-2 text-sm leading-6 italic opacity-70">{item.example}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
