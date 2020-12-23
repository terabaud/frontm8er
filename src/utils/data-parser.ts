import yaml from 'yaml';
import json5 from 'json5';
import { promises as fsp } from 'fs';
import glob from 'glob';
import { promisify } from 'util';

const DATA_PATTERN = /\.(json|json5|yml|yaml)$/;

/**
 * Resolves all files from an array of file patterns
 *
 * @param {string[]} dataFilePatterns array of file patterns, eg. ['*.json', '*.yaml']
 * @returns {object[]} array of parsed files
 */
export async function readDataFiles(
  dataFilePatterns: string[]
): Promise<any[]> {
  const resolveDataFiles = Promise.all(
    dataFilePatterns.map((item) => promisify(glob)(item))
  );
  const dataFiles = (await resolveDataFiles).flat();
  const dataContents = dataFiles.flat().map(async (item) => {
    if (!DATA_PATTERN.test(item)) {
      return;
    }
    const content = await fsp.readFile(item, 'utf-8');
    if (/\.ya?ml$/.test(item)) {
      return yaml.parse(content);
    }
    if (/\.json5?$/.test(item)) {
      return json5.parse(content);
    }
    return {};
  });
  return await Promise.all(dataContents);
}

export async function readDataFilesToObject(
  dataFilePatterns: string[]
): Promise<Record<string, any>> {
  const dataContents = await readDataFiles(dataFilePatterns);
  return Object.assign.apply(null, [{}, ...dataContents]);
}
