import * as vscode from 'vscode';

let activeDecorations: vscode.TextEditorDecorationType[] = [];
let statusBar: vscode.StatusBarItem;
let lastMatchIndex = 0;
let diagnosticCollection: vscode.DiagnosticCollection;

function getKeywordsFromConfig() {
	const config = vscode.workspace.getConfiguration('todoHighlighter');
	const keywords = config.get<{ word: string; color: string }[]>('keywords') ?? [];
	const commentsOnly = config.get<boolean>('commentsOnly') ?? '';
	const searchWord = config.get<string>('searchWord') ?? '';
	return { keywords, commentsOnly, searchWord };
}

function clearDecorations() {
  activeDecorations.forEach(d => d.dispose());
  activeDecorations = [];
}

function updateDiagnostics(editor: vscode.TextEditor) {
	const text = editor.document.getText();
	const { keywords } = getKeywordsFromConfig();
	const diagnostics: vscode.Diagnostic[] = [];

	for(const { word } of keywords) {
		if(!word) { continue; }
		const regex = new RegExp(word, 'gi');
		let match;

		while ((match = regex.exec(text)) !== null) {			const startPos = editor.document.positionAt(match.index);
			const endPos = editor.document.positionAt(match.index + match[0].length);
			const range = new vscode.Range(startPos, endPos);

			const diagnostic = new vscode.Diagnostic(
				range,
				`${word.toUpperCase()}: ${editor.document.lineAt(startPos.line).text.trim()}`,
				vscode.DiagnosticSeverity.Information
			);
			diagnostic.source = 'Todo Highlighter';
			diagnostics.push(diagnostic);
		}
	}
	diagnosticCollection.set(editor.document.uri, diagnostics);
}

function colorToGutterIcon(color: string): vscode.Uri {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6">
    <circle cx="3" cy="3" r="3" fill="${color}"/>
  </svg>`;
  const encoded = encodeURIComponent(svg);
  return vscode.Uri.parse(`data:image/svg+xml;utf8,${encoded}`);
}

function isInComment(text: string, index: number): boolean {
	const lineStart = text.lastIndexOf('\n', index - 1) + 1;
	const lineText = text.slice(lineStart, index);
	return /\/\/|#|--|\/\*/.test(lineText);
}

function updateDecorations(editor: vscode.TextEditor) {
	clearDecorations();

	const text = editor.document.getText();
	const { keywords, commentsOnly, searchWord } = getKeywordsFromConfig();
	const counts: string[] = [];

	const allKeywords = [...keywords];
	if(searchWord.trim()) {
		allKeywords.push({ word: searchWord.trim(), color: 'rgba(180, 100, 255, 0.4)'})
	}

	for (const { word, color } of allKeywords) {
		if (!word) { continue; }

		const decoration = vscode.window.createTextEditorDecorationType({
		backgroundColor: color,
		fontWeight: 'bold',
		borderRadius: '3px',
		gutterIconPath: colorToGutterIcon(color),
		gutterIconSize: 'contain',
		});

		activeDecorations.push(decoration);

		const ranges: vscode.Range[] = [];
		const regex = new RegExp(word, 'gi');
		let match;

		while ((match = regex.exec(text)) !== null) {
			if(commentsOnly && !isInComment(text, match.index)) {
				continue;
			}

			const startPos = editor.document.positionAt(match.index);
			const endPos = editor.document.positionAt(match.index + match[0].length);
			ranges.push(new vscode.Range(startPos, endPos));
		}

		if (ranges.length > 0) {
		counts.push(`${word}: ${ranges.length}`);
		}

		editor.setDecorations(decoration, ranges);
	}
	updateDiagnostics(editor);

	if (counts.length > 0) {
		statusBar.text = `$(tag) ${counts.join(' | ')} $(arrow-right)`;
		statusBar.tooltip = 'Click to jump to next keyword';
		statusBar.show();
	} else {
		statusBar.text = `$(tag) No TODOs`;
		statusBar.show();
	}
}

	function jumpToNextKeyword(editor: vscode.TextEditor) {
	const text = editor.document.getText();
	const { keywords } = getKeywordsFromConfig();
	const pattern = keywords.map(k => k.word).join('|');
	const regex = new RegExp(pattern, 'gi');

	const matches: { index: number; length: number }[] = [];
	let match;
	while ((match = regex.exec(text)) !== null) {
		matches.push({ index: match.index, length: match[0].length });
	}

	if (matches.length === 0) { return; }
	if (lastMatchIndex >= matches.length) { lastMatchIndex = 0; }

	const { index, length } = matches[lastMatchIndex];
	lastMatchIndex++;

	const startPos = editor.document.positionAt(index);
	const endPos = editor.document.positionAt(index + length);
	editor.selection = new vscode.Selection(startPos, endPos);
	editor.revealRange(new vscode.Range(startPos, endPos), vscode.TextEditorRevealType.InCenter);
}

// --- Workspace-wide search ---
interface KeywordMatch {
  file: string;
  filePath: string;
  line: number;
  text: string;
  word: string;
  color: string;
}

async function searchWorkspace(): Promise<KeywordMatch[]> {
  const { keywords } = getKeywordsFromConfig();
  const results: KeywordMatch[] = [];

  // Find all code files, ignore node_modules and out folders
  const files = await vscode.workspace.findFiles(
    '**/*.{ts,js,py,css,html,json,md}',
    '**/node_modules/**,**/out/**'
  );

  for (const fileUri of files) {
    const doc = await vscode.workspace.openTextDocument(fileUri);
    const text = doc.getText();
    const lines = text.split('\n');

    for (const { word, color } of keywords) {
      const regex = new RegExp(word, 'gi');
      lines.forEach((lineText, lineIndex) => {
        if (regex.test(lineText)) {
          results.push({
            file: vscode.workspace.asRelativePath(fileUri),
            filePath: fileUri.fsPath,
            line: lineIndex + 1,
            text: lineText.trim(),
            word: word.toUpperCase(),
            color,
          });
        }
        regex.lastIndex = 0;
      });
    }
  }

  return results;
}

function getSummaryHtml(matches: KeywordMatch[]): string {
  const grouped: Record<string, KeywordMatch[]> = {};
  for (const m of matches) {
    if (!grouped[m.file]) { grouped[m.file] = []; }
    grouped[m.file].push(m);
  }

  const total = matches.length;
  const keywords = [...new Set(matches.map(m => m.word))];
  const colorMap: Record<string, string> = {};
  matches.forEach(m => { colorMap[m.word] = m.color; });

  const keyworCounts: Record<string, number> = {};
  matches.forEach(m => {
	keyworCounts[m.word] = (keyworCounts[m.word] || 0) + 1;
  });

  const fileCounts = Object.entries(grouped).map(([file, items]) => ({ file, count: items.length })).sort((a, b) => b.count - a.count).slice(0, 5);

  const fileBlocks = Object.entries(grouped).map(([file, items]) => {
    const rows = items.map(item => `
      <tr class="match-row" data-word="${item.word}" data-file="${item.filePath}" data-line="${item.line}">
        <td><span class="badge" style="background:${item.color}">${item.word}</span></td>
        <td class="line-num">L${item.line}</td>
        <td class="match-text">${item.text.replace(/</g, '&lt;')}</td>
      </tr>
    `).join('');

    return `
      <div class="file-block" data-file="${file}">
        <div class="file-name">📄 ${file}</div>
        <table>${rows}</table>
      </div>
    `;
  }).join('');

  const filterButtons = keywords.map(word => `
    <button class="filter-btn" data-word="${word}" style="border-color:${colorMap[word]}"
      onclick="toggleFilter('${word}')">
      ${word}
    </button>
  `).join('');

	const chartKeywordData = JSON.stringify(
		keywords.map(w => ({ word: w, count: keyworCounts[w], color: colorMap[w] }))
	);

	const chartFileData = JSON.stringify(fileCounts);

	return `<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="UTF-8">
	<style>
	body { font-family: var(--vscode-font-family); padding: 16px; color: var(--vscode-foreground); }
	h1 { font-size: 18px; margin-bottom: 4px; }
	h2 { font-size: 14px; margin: 20px 0 10px; opacity: 0.8; }
	.subtitle { font-size: 13px; opacity: 0.6; margin-bottom: 16px; }
	.toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; }
	.refresh-btn {
		padding: 5px 12px;
		background: var(--vscode-button-background);
		color: var(--vscode-button-foreground);
		border: none; border-radius: 4px; cursor: pointer; font-size: 12px;
	}
	.refresh-btn:hover { background: var(--vscode-button-hoverBackground); }
	.filter-btn {
		padding: 4px 12px; border-radius: 20px; cursor: pointer; font-size: 12px;
		font-weight: bold; border: 2px solid;
		background: transparent; color: var(--vscode-foreground);
		opacity: 0.5; transition: opacity 0.15s;
	}
	.filter-btn.active { opacity: 1; }

	/* Stats section */
	.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
	.chart-box { background: var(--vscode-editor-background); border-radius: 8px; padding: 14px; }
	.chart-title { font-size: 12px; font-weight: bold; opacity: 0.6; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
	.bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
	.bar-label { font-size: 11px; width: 80px; text-align: right; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.bar-track { flex: 1; background: var(--vscode-input-background); border-radius: 4px; height: 16px; overflow: hidden; }
	.bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 5px; }
	.bar-count { font-size: 10px; font-weight: bold; color: #fff; }
	.total-badge {
		display: inline-block; padding: 3px 10px; border-radius: 20px;
		background: var(--vscode-badge-background); color: var(--vscode-badge-foreground);
		font-size: 12px; font-weight: bold; margin-bottom: 16px;
	}

	/* Results section */
	.file-block { margin-bottom: 24px; }
	.file-name { font-weight: bold; font-size: 13px; margin-bottom: 6px; opacity: 0.8; }
	table { width: 100%; border-collapse: collapse; }
	.match-row { cursor: pointer; }
	.match-row:hover td { background: var(--vscode-list-hoverBackground); }
	.match-row.hidden { display: none; }
	td { padding: 5px 8px; font-size: 13px; vertical-align: top; }
	.badge { display: inline-block; padding: 1px 7px; border-radius: 4px; font-weight: bold; font-size: 11px; }
	.line-num { opacity: 0.5; white-space: nowrap; width: 40px; }
	.match-text { font-family: var(--vscode-editor-font-family); opacity: 0.85; }
	.empty { opacity: 0.5; font-size: 14px; margin-top: 40px; text-align: center; }
	.divider { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 24px 0; opacity: 0.3; }
	</style>
	</head>
	<body>
	<h1>🏷 Todo Highlighter Summary</h1>
	<div class="subtitle" id="subtitle">${total} match${total !== 1 ? 'es' : ''} found across ${Object.keys(grouped).length} file${Object.keys(grouped).length !== 1 ? 's' : ''}</div>

	${total > 0 ? `
	<!-- Statistics -->
	<div class="stats-grid">
	<div class="chart-box">
		<div class="chart-title">By Keyword</div>
		<div id="keyword-chart"></div>
	</div>
	<div class="chart-box">
		<div class="chart-title">Top Files</div>
		<div id="file-chart"></div>
	</div>
	</div>
	<hr class="divider">
	` : ''}

	<!-- Toolbar -->
	<div class="toolbar">
	<button class="refresh-btn" onclick="refresh()">⟳ Refresh</button>
	<button class="filter-btn active" id="filter-all" onclick="showAll()">ALL</button>
	${filterButtons}
	</div>

	${total === 0 ? '<div class="empty">No keywords found in workspace 🎉</div>' : fileBlocks}

	<script>
	const vscode = acquireVsCodeApi();
	let activeFilters = new Set();

	// --- Charts ---
	const keywordData = ${chartKeywordData};
	const fileData = ${chartFileData};

	function renderBarChart(containerId, items, labelKey, countKey, colorFn, maxCount) {
		const container = document.getElementById(containerId);
		if (!container) { return; }
		container.innerHTML = items.map(item => {
		const pct = Math.max(8, Math.round((item[countKey] / maxCount) * 100));
		const color = colorFn(item);
		return \`
			<div class="bar-row">
			<div class="bar-label" title="\${item[labelKey]}">\${item[labelKey]}</div>
			<div class="bar-track">
				<div class="bar-fill" style="width:\${pct}%;background:\${color}">
				<span class="bar-count">\${item[countKey]}</span>
				</div>
			</div>
			</div>
		\`;
		}).join('');
	}

	if (keywordData.length > 0) {
		const maxKw = Math.max(...keywordData.map(k => k.count));
		renderBarChart('keyword-chart', keywordData, 'word', 'count', i => i.color, maxKw);

		const maxF = Math.max(...fileData.map(f => f.count));
		renderBarChart('file-chart', fileData, 'file', 'count', () => 'var(--vscode-progressBar-background)', maxF);
	}

	// --- Filters ---
	document.querySelectorAll('.filter-btn[data-word]').forEach(btn => {
		btn.classList.add('active');
		activeFilters.add(btn.dataset.word);
	});

	function toggleFilter(word) {
		const btn = document.querySelector('.filter-btn[data-word="' + word + '"]');
		const allBtn = document.getElementById('filter-all');
		if (activeFilters.has(word)) {
		activeFilters.delete(word);
		btn.classList.remove('active');
		} else {
		activeFilters.add(word);
		btn.classList.add('active');
		}
		const allBtns = document.querySelectorAll('.filter-btn[data-word]');
		allBtn.classList.toggle('active', activeFilters.size === allBtns.length || activeFilters.size === 0);
		applyFilters();
	}

	function showAll() {
		activeFilters.clear();
		document.querySelectorAll('.filter-btn[data-word]').forEach(btn => {
		activeFilters.add(btn.dataset.word);
		btn.classList.add('active');
		});
		document.getElementById('filter-all').classList.add('active');
		applyFilters();
	}

	function applyFilters() {
		let visibleCount = 0;
		document.querySelectorAll('.match-row').forEach(row => {
		const show = activeFilters.size === 0 || activeFilters.has(row.dataset.word);
		row.classList.toggle('hidden', !show);
		if (show) { visibleCount++; }
		});
		document.querySelectorAll('.file-block').forEach(block => {
		const hasVisible = block.querySelectorAll('.match-row:not(.hidden)').length > 0;
		block.style.display = hasVisible ? '' : 'none';
		});
		document.getElementById('subtitle').textContent =
		visibleCount + ' match' + (visibleCount !== 1 ? 'es' : '') + ' shown';
	}

	// --- Row clicks ---
	document.querySelectorAll('.match-row').forEach(row => {
		row.addEventListener('click', () => {
		vscode.postMessage({
			command: 'openFile',
			file: row.dataset.file,
			line: parseInt(row.dataset.line)
		});
		});
	});

	function refresh() {
		vscode.postMessage({ command: 'refresh' });
	}
	</script>
	</body>
	</html>`;
}
async function showSummaryPanel(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'todoSummary',
    '🏷 Todo Summary',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  async function loadContent() {
    panel.webview.html = `<html><body><p style="padding:20px;font-family:sans-serif">🔍 Scanning workspace...</p></body></html>`;
    const matches = await searchWorkspace();
    panel.webview.html = getSummaryHtml(matches);
  }

  await loadContent();

  // Handle clicks from the webview
  panel.webview.onDidReceiveMessage(async msg => {
    if (msg.command === 'openFile') {
      const uri = vscode.Uri.file(msg.file);
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
      const line = msg.line - 1;
      const range = new vscode.Range(line, 0, line, 0);
      editor.selection = new vscode.Selection(range.start, range.end);
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }
    if (msg.command === 'refresh') {
      await loadContent();
    }
  }, undefined, context.subscriptions);
}

export function activate(context: vscode.ExtensionContext) {
  console.log('✅ Todo Highlighter is active!');

	statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBar.text = `$(tag) Loading...`;
	statusBar.show();
	context.subscriptions.push(statusBar);
	diagnosticCollection = vscode.languages.createDiagnosticCollection('todoHighlighter');
	context.subscriptions.push(diagnosticCollection);

	if (vscode.window.activeTextEditor) {
		updateDecorations(vscode.window.activeTextEditor);
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) { updateDecorations(editor); }
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
		updateDecorations(editor);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('todoHighlighter')) {
		const editor = vscode.window.activeTextEditor;
		if (editor) { updateDecorations(editor); }
		}
	}, null, context.subscriptions);

	// Jump command
	const jumpCommand = vscode.commands.registerCommand('todoHighlighter.jumpToNext', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) { jumpToNextKeyword(editor); }
	});
	context.subscriptions.push(jumpCommand);
	statusBar.command = 'todoHighlighter.jumpToNext';

	// Summary command
	const summaryCommand = vscode.commands.registerCommand('todoHighlighter.showSummary', () => {
		showSummaryPanel(context);
	});
	context.subscriptions.push(summaryCommand);
}

export function deactivate() {
  clearDecorations();
  diagnosticCollection.clear();
  diagnosticCollection.dispose();
}