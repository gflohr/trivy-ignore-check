import * as fs from 'fs';
import { Ignorefile } from './Ignorefile';

jest.mock('fs');

describe('Ignorefile', () => {
	const mockedReadFileSync = fs.readFileSync as jest.MockedFunction<
		typeof fs.readFileSync
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('parses ids from file, strips comments and empty lines', () => {
		mockedReadFileSync.mockReturnValue(
			`
# Full line comment.
CVE-001
CVE-002   # Inline comment
   CVE-003

# Another comment
`,
		);

		const ignorefile = new Ignorefile('dummy.txt');

		expect(mockedReadFileSync).toHaveBeenCalledWith('dummy.txt', 'utf8');

		expect(ignorefile.ids).toEqual(['CVE-001', 'CVE-002', 'CVE-003']);
	});

	it('returns empty array if file contains no valid ids', () => {
		mockedReadFileSync.mockReturnValue(`
# only comments
   # still comment
`);

		const ignorefile = new Ignorefile('dummy.txt');

		expect(ignorefile.ids).toEqual([]);
	});
});
