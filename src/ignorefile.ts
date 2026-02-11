import * as fs from 'fs';

export class Ignorefile {
	private _ids: string[] = [];

	constructor(filename: string) {
		const contents = fs.readFileSync(filename, 'utf8');
		const lines = contents.split('\n');
		for (let i = 0; i < lines.length; ++i) {
			const line = lines[i].replace(/#.*/, '').trim();
			if (line.length) this._ids.push(line);
		}
	}

	public get ids(): string[] {
		return this._ids;
	}
}
