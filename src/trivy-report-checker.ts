import * as fs from 'fs';
import { TrivyReport } from './trivy-report';

type HitCallback = (id: string) => void;
type ExitCallback = (code: 0 | 1 | 2) => void;

export class TrivyReportChecker {
	private readonly report: TrivyReport;

	constructor(filename?: string) {
		const contents =
			typeof filename === 'undefined'
				? fs.readFileSync(0, 'utf8')
				: fs.readFileSync(filename, 'utf8');

		this.report = JSON.parse(contents);
	}

	public check(
		ignoredIDs: string[],
		hitCallback: HitCallback = console.log,
		exitCallback: ExitCallback = process.exit,
	) {
		const foundIDs: string[] = [];
		this.report.Results?.forEach(result => {
			result.Vulnerabilities?.forEach(v => {
				foundIDs.push(v.VulnerabilityID);
			});
		});

		let unneeded = 0;
		const seen: string[] = [];

		for (let i = 0; i < ignoredIDs.length; ++i) {
			const id = ignoredIDs[i];
			if (seen.includes[id]) {
				continue;
			}
			seen.push(id);

			if (!foundIDs.includes(id)) {
				hitCallback(id);
				++unneeded;
			}
		}

		exitCallback(unneeded ? 2 : 0);
	}
}
