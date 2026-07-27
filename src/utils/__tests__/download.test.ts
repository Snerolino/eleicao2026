import { describe, it, expect, vi } from 'vitest';
import { downloadCandidatesCSV } from '../download';

describe('downloadCandidatesCSV', () => {
  it('sanitizes fields to prevent CSV formula injection', () => {
    // Mock URL and Blob and document.createElement
    const createObjectURL = vi.fn().mockReturnValue('blob:test');
    const revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;


    global.document = {
      createElement: vi.fn().mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            set href(_val: string) {},
            set download(_val: string) {},
            click: () => {}
          };
        }
        return {};
      })
    } as any;

    // Mock Blob
    let blobContent: string[] = [];
    global.Blob = vi.fn().mockImplementation((content: string[], _options: any) => {
      blobContent = content;
      return {};
    }) as any;

    const candidates = [
      {
        full_name: '=cmd|\\\' /C calc\'!A0',
        party: '+SUM(1+1)',
        ballot_number: -123,
        position_label: '@SUM(1+1)',
        claims: [{ content: '\tTABBED', source_document: { source_name: '\rCARRIAGE' } }],
        photo_url: 'http://example.com'
      }
    ];

    downloadCandidatesCSV(candidates as any);

    expect(blobContent.length).toBeGreaterThan(0);
    const csvStr = blobContent[0];
    const rows = csvStr.split('\n');

    expect(rows[1]).toContain('"\'-123"'); // ballot_number
    expect(rows[1]).toContain('"\'=cmd|\\\' /C calc\'!A0"'); // full_name
    expect(rows[1]).toContain('"\'+SUM(1+1)"'); // Wait, party is +SUM, should be "'+SUM(1+1)"
    expect(rows[1]).toContain('"\'@SUM(1+1)"'); // position_label
    expect(rows[1]).toContain('"\'' + '\tTABBED"'); // content
    expect(rows[1]).toContain('"\'' + '\rCARRIAGE"'); // source_name

    // Clean up
    vi.restoreAllMocks();
  });
});
