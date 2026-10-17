import { Cloud, CloudDrizzle, CloudFog, CloudHail, CloudLightning, CloudMoon, CloudRain, CloudRainWind, CloudSnow, CloudSun, HelpCircle, Moon, Snowflake, Sun } from "lucide-react";
import type { WeatherCategory } from "@tooloralabs/tools";

type Props = { category: WeatherCategory; night?: boolean; size?: number; className?: string };

/** Icon for a MET Norway–derived weather category (day/night variants for the clear and fair skies). */
export default function WeatherIcon({ category, night = false, size = 20, className = "" }: Props) {
  const props = { size, className, "aria-hidden": true } as const;
  switch (category) {
    case "clearSky":
      return night ? <Moon {...props} /> : <Sun {...props} />;
    case "fair":
    case "partlyCloudy":
      return night ? <CloudMoon {...props} /> : <CloudSun {...props} />;
    case "cloudy":
      return <Cloud {...props} />;
    case "fog":
      return <CloudFog {...props} />;
    case "lightRain":
      return <CloudDrizzle {...props} />;
    case "rain":
      return <CloudRain {...props} />;
    case "heavyRain":
    case "rainShowers":
      return <CloudRainWind {...props} />;
    case "sleet":
      return <CloudHail {...props} />;
    case "snow":
      return <CloudSnow {...props} />;
    case "snowShowers":
      return <Snowflake {...props} />;
    case "thunderstorm":
      return <CloudLightning {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
}
