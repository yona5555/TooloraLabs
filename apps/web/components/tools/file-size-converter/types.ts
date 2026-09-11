import type { FileSizeUnit, FileSizeStandard } from "@tooloralabs/tools";

export type FileSizeScenario = { key: string; value: string; unit: FileSizeUnit; standard: FileSizeStandard };

/** Real, everyday file-size examples spanning a wide range of units. */
export const FILE_SIZE_SCENARIOS: FileSizeScenario[] = [
  { key: "photoJpeg", value: "5", unit: "MB", standard: "decimal" },
  { key: "mp3Song", value: "8", unit: "MB", standard: "decimal" },
  { key: "hdMovie", value: "4", unit: "GB", standard: "decimal" },
  { key: "usbDrive", value: "64", unit: "GB", standard: "decimal" },
];
