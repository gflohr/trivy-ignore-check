#! /usr/bin/env node

import { Ignorefile } from './ignorefile';
import { TrivyReportChecker } from './trivy-report-checker';

if (process.argv.length < 3) {
	console.error(`usage: ${process.argv[1]} IGNOREFILE [TRYVY-JSON-REPORT]`);
	process.exit(1);
}

new TrivyReportChecker(process.argv.slice(3)).check(
	new Ignorefile(process.argv[2]).ids,
);
