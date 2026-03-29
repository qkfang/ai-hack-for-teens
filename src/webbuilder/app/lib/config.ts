export function getActiveSampleName(): string {
  return process.env.SAMPLE_NAME || "startup-app";
}

export function getSamplesDir(): string {
  return "samples";
}

export const config = {
  get sampleName() { return getActiveSampleName(); },
  get samplesDir() { return getSamplesDir(); },
};
