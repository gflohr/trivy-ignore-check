import * as fs from 'fs';

import { type TrivyReport } from './trivy-report';

type HitCallback = (id: string) => void;
type ExitCallback = (code: 0 | 1 | 2) => void;

export class TrivyReportChecker {
	private readonly reports: TrivyReport[] = [];

	constructor(filenames?: string[]) {
		const reportFilenames: Array<string | number> =
			(filenames && filenames.length) ? filenames : [ 0 ];

		reportFilenames.forEach(filename => {
			const contents = fs.readFileSync(filename, 'utf8');
			this.reports.push(JSON.parse(contents));
		});
	}

	public check(
		ignoredIDs: string[],
		hitCallback: HitCallback = console.log,
		exitCallback: ExitCallback = process.exit,
	) {
		const foundIDs: string[] = [];

		this.reports.forEach(report => {
			report.Results.forEach(result => {
				result.Vulnerabilities?.forEach(v => {
					foundIDs.push(v.VulnerabilityID);
				});
			});
		});

		let unneeded = 0;
		const seen: Set<string> = new Set<string>();

		for (let i = 0; i < ignoredIDs.length; ++i) {
			const id = ignoredIDs[i];
			if (seen.has(id)) {
				continue;
			}
			seen.add(id);

			if (!foundIDs.includes(id)) {
				hitCallback(id);
				++unneeded;
			}
		}

		exitCallback(unneeded ? 2 : 0);
	}
}
