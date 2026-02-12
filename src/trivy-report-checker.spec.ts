// src/trivy-report-checker.spec.ts
import * as fs from 'fs';

import { type TrivyReport } from './trivy-report';
import { TrivyReportChecker } from './trivy-report-checker';

jest.mock('fs');
jest.mock('console');

describe('TrivyReportChecker', () => {
	const mockReport: TrivyReport = {
		Results: [
			{
				Vulnerabilities: [
					{ VulnerabilityID: 'CVE-1234' },
					{ VulnerabilityID: 'CVE-5678' },
				],
			},
			{
				Vulnerabilities: [{ VulnerabilityID: 'CVE-9999' }],
			},
			{ /* Vulnerabilities are optional. */ },
		],
	};

	beforeEach(() => {
		(fs.readFileSync as jest.Mock).mockImplementation(() =>
			JSON.stringify(mockReport),
		);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('calls hitCallback for IDs not found in the report', () => {
		const hitCallback = jest.fn();
		const exitCallback = jest.fn();

		const checker = new TrivyReportChecker(['dummy.json']);
		checker.check(
			['CVE-1234', 'CVE-5678', 'CVE-ABCD'], // ignored IDs
			hitCallback,
			exitCallback,
		);

		// Only the missing ID triggers hitCallback
		expect(hitCallback).toHaveBeenCalledTimes(1);
		expect(hitCallback).toHaveBeenCalledWith('CVE-ABCD');

		// exitCallback called with 2 because there was unneeded ID.
		expect(exitCallback).toHaveBeenCalledWith(2);
	});

	it('calls exitCallback with 0 when all IDs are present', () => {
		const hitCallback = jest.fn();
		const exitCallback = jest.fn();

		const checker = new TrivyReportChecker(['dummy.json']);
		checker.check(
			['CVE-1234', 'CVE-5678', 'CVE-9999'], // all IDs present
			hitCallback,
			exitCallback,
		);

		expect(hitCallback).not.toHaveBeenCalled();
		expect(exitCallback).toHaveBeenCalledWith(0);
	});

	it('removes duplicates in ignoredIDs', () => {
		const hitCallback = jest.fn();
		const exitCallback = jest.fn();

		const checker = new TrivyReportChecker(['dummy.json']);
		checker.check(
			['CVE-ABCD', 'CVE-ABCD'], // duplicate unneeded ID
			hitCallback,
			exitCallback,
		);

		// hitCallback called only once for the duplicate
		expect(hitCallback).toHaveBeenCalledTimes(1);
		expect(hitCallback).toHaveBeenCalledWith('CVE-ABCD');
		expect(exitCallback).toHaveBeenCalledWith(2);
	});
});

describe('TrivyReportChecker input/output selection', () => {
	beforeEach(() => {
		(fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should read input from a given file', () => {
		new TrivyReportChecker(['report.json']);
		expect(fs.readFileSync).toHaveBeenCalledWith('report.json', 'utf8');
	});

	it('should fall back to standard input', () => {
		new TrivyReportChecker();
		expect(fs.readFileSync).toHaveBeenCalledWith(0, 'utf8');
	});
});

describe('TrivyReportChecker callbacks', () => {
	const mockReport: TrivyReport = {
		Results: [
			{
				Vulnerabilities: [{ VulnerabilityID: 'CVE-1234' }],
			},
		],
	};

	beforeEach(() => {
		(fs.readFileSync as jest.Mock).mockImplementation(() =>
			JSON.stringify(mockReport),
		);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('falls back to console.log and process.exit', () => {
		const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
			// Prevent Jest from exiting.
			throw new Error('process.exit called');
		});

		const checker = new TrivyReportChecker(['dummy.json']
		);

		try {
			checker.check(['CVE-ABCD']);
		} catch (e) {
			if ((e as Error).message !== 'process.exit called') throw e;
		}

		expect(consoleSpy).toHaveBeenCalledWith('CVE-ABCD');

		expect(exitSpy).toHaveBeenCalledWith(2);

		consoleSpy.mockRestore();
		exitSpy.mockRestore();
	});
});
