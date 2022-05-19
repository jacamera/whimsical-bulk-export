(async function () {
	const
		openDirectoryWait = 1000,
		openMenuWait = 1000,
		loadItemWait = 5000,
		printWait = 5000;
	
	const shareButtonSelector = 'div[role="banner"] div[style*="titlebar-icons-40x40_634935ff6c1b66c1fb9c24d03870d24d.svg"][style*="background-position: -240px 0px;"]';

	const topLevelDirs = document.querySelectorAll('div[role="navigation"] a[data-tooltip-id]');

	if (!topLevelDirs.length) {
		console.error(formatLogMessage('Couldn\'t find the top level directories.'));
		return;
	}

	async function exportFiles() {
		console.log(formatLogMessage('Starting export...'));
		let paths = [];
		for (const topDir of topLevelDirs) {
			const dirName = topDir.lastElementChild.textContent;
			while (isClosedDirectory(topDir)) {
				await openDirectory(topDir, dirName);
			}
			if (topDir.nextElementSibling) {
				paths = paths.concat(await search(topDir.nextElementSibling, [dirName], []));
			}
		}
		console.log(formatLogMessage(`Export finished. Paths processed: ${paths.length}.`));
		console.log(formatLogMessage('Save the following list of items for the next step:'));
		console.log(paths.join('\n'));
		return paths;
	}

	async function search(e, dirs, paths) {
		if (e.tagName === 'DIV' && e.style.userSelect === 'none') {
			const
				firstChild = e.firstElementChild,
				a = findFirstChild(firstChild, 'A'),
				label = a.lastElementChild.textContent,
				path = dirs.join('/') + '/' + label;
			// Attempt to open the item first, then check if it is really a directory.
			// Documents sometimes appear to be directories until they are first clicked on.
			while (isClosedDirectory(firstChild)) {
				await openDirectory(firstChild, label);
			}
			if (isDirectory(firstChild)) {
				while (isClosedDirectory(firstChild)) {
					await openDirectory(firstChild, label);
				}
				dirs.push(label);
				for (const child of e.lastElementChild.children) {
					await search(child, dirs, paths);
				}
				dirs.pop();
			}
			await loadItem(a, label);
			if (await tryPrint(label)) {
				paths.push(path);
			}
		} else {
			for (const child of e.children) {
				await search(child, dirs, paths);
			}
		}
		return paths;
	}

	function findFirstChild(e, tagName) {
		let child = e.firstElementChild;
		while (child?.tagName !== tagName && child?.firstElementChild) {
			child = child.firstElementChild;
		}
		return child;
	}

	function isDirectory(e) {
		const svg = findFirstChild(e, 'svg');
		if (!svg) {
			return false;
		}
		return svg.style.transform.includes('rotate') && svg.firstElementChild.tagName !== 'ellipse';
	}

	function isClosedDirectory(e) {
		// Double check that this is really a directory here to avoid an infinite loop.
		// Some documents originally appear as a directory and then render with an ellipse after trying to open it.
		if (!isDirectory(e)) {
			return false;
		}
		const svg = findFirstChild(e, 'svg');
		if (!svg) {
			return false;
		}
		return svg.style.transform.includes('rotate(0deg)');
	}

	async function openDirectory(e, label) {
		console.log(formatLogMessage(`Opening directory: ${label}.`), e);
		const svg = findFirstChild(e, 'svg');
		if (!svg) {
			console.log(formatLogMessage(`\tFailed. Couldn't find icon.`));
			return;
		}
		svg.parentElement.click();
		return wait(openDirectoryWait);
	}

	async function loadItem(a, label) {
		console.log(formatLogMessage(`Loading item: ${label}.`), a);
		a.click();
		return wait(loadItemWait);
	}

	async function tryPrint(label) {
		console.log(formatLogMessage(`Trying to print item: ${label}.`));
		const shareButton = document.querySelector(shareButtonSelector);
		if (!shareButton) {
			console.log(formatLogMessage(`\tFailed. Couldn't find share button.`));
			return false;
		}
		shareButton.click();
		await wait(openMenuWait);
		const printButton = shareButton?.parentElement?.nextElementSibling?.firstElementChild?.lastElementChild;
		if (printButton?.textContent !== 'Print') {
			console.log(formatLogMessage(`\tFailed. Couldn't find print button.`));
			return false;
		}
		printButton.click();
		return wait(printWait).then(() => true);
	}

	function formatLogMessage(m) {
		return `[whimsical-bulk-export] ${m}`;
	}

	async function wait(t) {
		return new Promise(
			res => {
				setTimeout(res, t);
			}
		);
	}

	await exportFiles();
}());