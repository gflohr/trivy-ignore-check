import { Ignorefile } from './ignorefile';

if (process.argv.length !== 3 && process.argv.length !== 4) {
	console.error(`usage: ${process.argv[1]} IGNOREFILE [TRYVY-JSON-REPORT]`);
	process.exit(1);
}

const ignorefile = new Ignorefile(process.argv[2]);
