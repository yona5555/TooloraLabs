import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from "lucide-react";
import type { WeatherCategory } from "@tooloralabs/tools";

const CATEGORY_ICONS: Record<WeatherCategory, LucideIcon> = {
  clearSky: Sun,
  mainlyClear: Sun,
  partlyCloudy: CloudSun,
  overcast: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  freezingDrizzle: CloudDrizzle,
  rain: CloudRain,
  freezingRain: CloudRain,
  snow: CloudSnow,
  snowGrains: CloudSnow,
  rainShowers: CloudRain,
  snowShowers: CloudSnow,
  thunderstorm: CloudLightning,
  thunderstormHail: CloudLightning,
  unknown: Cloud,
};

type WeatherIconProps = {
  category: WeatherCategory;
  size?: number;
  className?: string;
};

export default function WeatherIcon({ category, size = 32, className = "" }: WeatherIconProps) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon size={size} className={className} aria-hidden="true" />;
}
