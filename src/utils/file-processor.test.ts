import { promises as fsp } from 'fs';
import { mocked } from 'ts-jest/utils';

import { processFrontmatterFiles } from './file-processor';
import { MatterParser } from './matter-parser';

const originalWriteFile = fsp.writeFile;
let virtualFS: Record<string, string> = {};

describe('processFrontmatterFiles tests', () => {
  beforeEach(() => {
    virtualFS = {};
    fsp.writeFile = jest.fn();
    mocked(fsp.writeFile).mockImplementation((file, contents) => {
      const fileName = (file.toString() || '').replace(/\/|\\/g, '/');
      virtualFS[fileName] = contents as string;
      return Promise.resolve();
    });
  });

  afterEach(() => {
    mocked(fsp.writeFile).mockClear();
  });

  afterAll(() => {
    fsp.writeFile = originalWriteFile;
  });

  test('processFrontmatterFiles without input files should throw an error', () => {
    return expect(
      processFrontmatterFiles({
        inputFilePatterns: [],
        dataFilePatterns: [
          'test/*.yaml',
          'test/*.json',
          'test/*.yml',
          'test/*.json5',
        ],
        data: { author: 'Lea Rosema' },
        addCreated: false,
        addModified: false,
      })
    ).rejects.toThrowError('no input files.');
  });

  test('processFrontmatterFiles does the things it should do.', async () => {
    await processFrontmatterFiles({
      inputFilePatterns: ['test/*.md'],
      dataFilePatterns: [
        'test/*.yaml',
        'test/*.json',
        'test/*.yml',
        'test/*.json5',
      ],
      data: { author: 'Lea Rosema' },
      addCreated: false,
      addModified: false,
    });
    expect(virtualFS['test/lea.md']).toBeDefined();
    const md = MatterParser.fromString(virtualFS['test/lea.md']);
    expect(md.metaData.author).toBe('Lea Rosema');
    expect(md.metaData.gender).toBe('female');
    expect(md.metaData.hobbies).toEqual(['sex', 'drugs', 'rocknroll']);
    expect(md.content).toBe(
      '\n# Hello World!\n\nLorem ipsum dolor sit amet.\n'
    );
  });

  test('processFrontmatterFiles does the things it should do. Also add created and modified times.', async () => {
    await processFrontmatterFiles({
      inputFilePatterns: ['test/*.md'],
      dataFilePatterns: [
        'test/*.yaml',
        'test/*.json',
        'test/*.yml',
        'test/*.json5',
      ],
      data: { author: 'terabaud' },
      addCreated: true,
      addModified: true,
    });
    expect(virtualFS['test/lea.md']).toBeDefined();
    const md = MatterParser.fromString(virtualFS['test/lea.md']);
    expect(md.metaData.author).toBe('terabaud');
    expect(md.metaData.gender).toBe('female');
    expect(md.metaData.hobbies).toEqual(['sex', 'drugs', 'rocknroll']);
    expect(md.content).toBe(
      '\n# Hello World!\n\nLorem ipsum dolor sit amet.\n'
    );
    expect(md.metaData.created).toBeDefined();
    expect(md.metaData.modified).toBeDefined();
  });

  test('processFrontmatterFiles does the things it should do. Also add modified time.', async () => {
    await processFrontmatterFiles({
      inputFilePatterns: ['test/*.md'],
      dataFilePatterns: [
        'test/*.yaml',
        'test/*.json',
        'test/*.yml',
        'test/*.json5',
      ],
      data: { author: 'Lea Rosema' },
      addCreated: false,
      addModified: true,
    });
    expect(virtualFS['test/lea.md']).toBeDefined();
    const md = MatterParser.fromString(virtualFS['test/lea.md']);
    expect(md.metaData.author).toBe('Lea Rosema');
    expect(md.metaData.gender).toBe('female');
    expect(md.metaData.hobbies).toEqual(['sex', 'drugs', 'rocknroll']);
    expect(md.content).toBe(
      '\n# Hello World!\n\nLorem ipsum dolor sit amet.\n'
    );
    expect(md.metaData.modified).toBeDefined();
  });

  test('processFrontmatterFiles does the things it should do. Also add created times.', async () => {
    await processFrontmatterFiles({
      inputFilePatterns: ['test/*.md'],
      dataFilePatterns: [
        'test/*.yaml',
        'test/*.json',
        'test/*.yml',
        'test/*.json5',
      ],
      data: { author: 'Lea Rosema' },
      addCreated: true,
      addModified: false,
    });
    expect(virtualFS['test/lea.md']).toBeDefined();
    const md = MatterParser.fromString(virtualFS['test/lea.md']);
    expect(md.metaData.author).toBe('Lea Rosema');
    expect(md.metaData.gender).toBe('female');
    expect(md.metaData.hobbies).toEqual(['sex', 'drugs', 'rocknroll']);
    expect(md.content).toBe(
      '\n# Hello World!\n\nLorem ipsum dolor sit amet.\n'
    );
    expect(md.metaData.created).toBeDefined();
  });

  test('processFrontmatterFiles does the things it should do. No extra data.', async () => {
    await processFrontmatterFiles({
      inputFilePatterns: ['test/*.md'],
      dataFilePatterns: [
        'test/*.yaml',
        'test/*.json',
        'test/*.yml',
        'test/*.json5',
      ],
    });
    expect(virtualFS['test/lea.md']).toBeDefined();
    const md = MatterParser.fromString(virtualFS['test/lea.md']);
    expect(md.metaData.author).toBe('Lea Rosema');
    expect(md.metaData.gender).toBe('female');
    expect(md.metaData.hobbies).toEqual(['sex', 'drugs', 'rocknroll']);
    expect(md.content).toBe(
      '\n# Hello World!\n\nLorem ipsum dolor sit amet.\n'
    );
  });

  test('processFrontmatterFiles does the things it should do. Also add created times. Write to dist', async () => {
    await processFrontmatterFiles({
      inputFilePatterns: ['*.md'],
      dataFilePatterns: ['*.yaml', '*.json', '*.yml', '*.json5'],
      data: { author: 'Lea Rosema' },
      addCreated: true,
      addModified: false,
      inputFolder: 'test',
      outputFolder: 'dist',
    });
    expect(virtualFS['dist/lea.md']).toBeDefined();
    const md = MatterParser.fromString(virtualFS['dist/lea.md']);
    expect(md.metaData.author).toBe('Lea Rosema');
    expect(md.metaData.gender).toBe('female');
    expect(md.metaData.hobbies).toEqual(['sex', 'drugs', 'rocknroll']);
    expect(md.content).toBe(
      '\n# Hello World!\n\nLorem ipsum dolor sit amet.\n'
    );
    expect(md.metaData.created).toBeDefined();
  });
});
