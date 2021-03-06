import { readDataFiles } from './data-parser';

describe('readDataFiles test', () => {
  test('readDataFiles reads all resolved files from provided file patterns', async () => {
    const datas = await readDataFiles([
      'test/*.yaml',
      'test/*.json',
      'test/*.yml',
      'test/*.json5',
      'test/*.txt',
    ]);
    const data: Record<string, any> = {};
    Object.assign.apply(null, [data, ...datas]);
    expect(data.author).toBe('Lea Rosema');
    expect(data.gender).toBe('female');
    expect(data.hobbies).toEqual(['sex', 'drugs', 'rocknroll']);
    expect(data.favoriteColour).toBe('hotpink');
  });
});
