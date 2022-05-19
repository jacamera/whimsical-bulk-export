const
	fs = require('fs'),
	path = require('path');

if (process.argv.length !== 4) {
	console.log('usage: node organize.js path/to/pdf/files path/to/fileList.txt');
	process.exit();
}

const duplicateFileRegex = /\s\(\d+\)\.pdf$/;

const dirPath = process.argv[2];

let files;
try {
	const dirStat = fs.statSync(dirPath);
	if (
		!dirStat.isDirectory()
	) {
		throw new Errow('File system entry is not a directory.');
	}
	const children = fs.readdirSync(
		dirPath,
		{
			withFileTypes: true
		}
	);
	files = children
		.filter(
			child => child.isFile() && child.name.endsWith('.pdf')
		)
		.map(
			child => {
				const stats = fs.statSync(
					path.join(dirPath, child.name)
				)
				return {
					...stats,
					name: child.name
				};
			}
		)
		.sort(
			(a, b) => a.birthtimeMs - b.birthtimeMs
		)
		.map(
			stat => stat.name
		);
	if (!files.length) {
		throw new Errow('No PDF files found in the directory.');
	}
} catch (e) {
	console.log(e?.message ?? 'Invalid file directory.');
	process.exit();
}

let list;
try {
	const listText = fs.readFileSync(
		process.argv[3],
		{
			encoding: 'utf8'
		}
	);
	list = listText
		.split('\n')
		.map(
			line => line
				.trim()
				.replace(/\s{2,}/, ' ')
		)
		.filter(
			line => line.length > 0
		);
	if (list.length !== files.length) {
		throw new Error('List count doesn\'t match file count.');
	}
} catch (e) {
	console.log(e?.message ?? 'Invalid file list.');
	process.exit();
}

console.log(`Organizing ${files.length} file${files.length === 1 ? '' : 's'}...`);

for (let i = 0; i < files.length; i++) {
	let fileName = files[i];
	const whimsicalPath = list[i];
	// Remove duplicate file suffix if present.
	if (
		duplicateFileRegex.test(fileName) && !duplicateFileRegex.test(whimsicalPath)
	) {
		fileName = fileName.replace(duplicateFileRegex, '.pdf');
	}
	// Make sure we can resolve the correct ancestor directories.
	const ancestorsPath = whimsicalPath.substring(0, whimsicalPath.length - (fileName.length - 4));
	if (!ancestorsPath.endsWith('/')) {
		console.warn(`Skipping file: ${files[i]}`);
		console.warn(`\tCouldn't resolve with path: ${whimsicalPath}`);
		continue;
	}
	// Create the ancestor directories.
	const ancestorsFsPath = path.join(dirPath, ancestorsPath);
	try {
		fs.statSync(ancestorsFsPath);
	} catch {
		fs.mkdirSync(ancestorsFsPath, { recursive: true });
	}
	// Move the file.
	fs.renameSync(
		path.join(dirPath, files[i]),
		path.join(dirPath, ancestorsPath, fileName)
	);
}