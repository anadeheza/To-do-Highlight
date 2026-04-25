# 🏷 Todo Highlighter

> Never lose track of a pending task in your code again.

Todo Highlighter is a VS Code extension that scans your code for keywords like `TODO`, `FIXME`, `HACK` and more — highlighting them with colors, showing counts in the status bar, and giving you a full workspace summary so nothing slips through the cracks.

---

## 💡 Why This Helps You as a Developer

As a developer, your codebase grows fast. You leave notes to yourself like `// TODO refactor this` or `// FIXME crashes on null` — and then forget about them buried in files you haven't opened in weeks.

Todo Highlighter solves this by making those notes **impossible to ignore**:

- You see colored highlights the moment you open a file
- The status bar always tells you how many pending tasks exist in the current file
- The Summary Panel scans your **entire project** so nothing is hidden
- You can jump between tasks with a single click instead of searching manually
- The Problems panel integrates your TODOs with VS Code's built-in warning system

Whether you're working alone or in a team, this extension keeps your technical debt visible and your workflow organized.

---

## ✨ Features at a Glance

| Feature | What it does |
|---|---|
| 🎨 Keyword highlighting | Colorful background on keywords as you type |
| 🔵 Gutter icons | Small colored circles in the line number margin |
| 📊 Status bar counter | Live count of keywords at the bottom of the screen |
| ➡️ Jump to next | Click the status bar to jump through each keyword |
| 🔍 Custom search | Highlight any word across all open files on demand |
| 📋 Summary panel | Full list of all keywords found across your workspace |
| 📈 Statistics | Bar charts showing keyword and file counts |
| 🗂 Filter | Filter the summary by keyword type |
| ⚠️ Problems panel | Keywords show up as VS Code info diagnostics |
| 💬 Comments only mode | Option to highlight only inside comments, not code |

---

## 🚀 Getting Started

Once the extension is active it works automatically — open any file and your keywords will be highlighted right away. No setup needed.

To open the **Command Palette** at any time press:
- `Ctrl+Shift+P` on Windows / Linux
- `Cmd+Shift+P` on Mac

---

## 📖 How to Use Each Feature

---

### 🎨 Keyword Highlighting

Keywords are highlighted automatically as you type. By default the following keywords are included:

| Keyword | Color |
|---|---|
| `TODO` | 🟡 Yellow |
| `FIXME` | 🔴 Red |
| `HACK` | 🟢 Green |
| `NOTE` | 🔵 Blue |
| `WARN` | 🟠 Orange |

Just type any of these in a comment and they light up instantly:

```js
// TODO fix this later
// FIXME this crashes on null input
// HACK workaround until the API is updated
// NOTE this function is called from three places
// WARN may cause memory leak on large files
```

---

### ⚙️ Changing Keywords and Colors

You can fully customize which words get highlighted and what color they use.

**How to open settings:**
1. Press `Ctrl+,` (or `Cmd+,` on Mac) to open Settings
2. Search for **Todo Highlighter**
3. Click **Edit in settings.json** under the Keywords section

**Example — adding your own keyword:**

```json
"todoHighlighter.keywords": [
  { "word": "TODO", "color": "rgba(255, 200, 0, 0.3)" },
  { "word": "FIXME", "color": "rgba(255, 80, 80, 0.3)" },
  { "word": "MYWORD", "color": "rgba(0, 200, 255, 0.3)" }
]
```

The color must be in `rgba(red, green, blue, opacity)` format. The opacity (last value) controls how strong the highlight is — `0.3` is subtle, `0.8` is very visible.

Changes apply instantly without reloading.

---

### 💬 Comments Only Mode

By default the extension only highlights keywords inside comments. You can turn this off to highlight keywords anywhere in your code — including variable names, strings, and function names.

**How to toggle:**
1. Open Settings (`Ctrl+,`)
2. Search for **Todo Highlighter**
3. Check or uncheck **Comments Only**

Or edit `settings.json` directly:

```json
"todoHighlighter.commentsOnly": true   // only highlights inside comments
"todoHighlighter.commentsOnly": false  // highlights everywhere in the file
```

---

### 📊 Status Bar Counter

At the bottom of your VS Code window you will always see a live count like:

```
🏷 TODO: 3 | FIXME: 1 | NOTE: 2  →
```

This updates automatically as you type. It only counts keywords in the **currently open file**.

---

### ➡️ Jump to Next Keyword

Instead of scrolling through your file manually, you can jump to each keyword one by one.

**How to use:**
- Click the **status bar item** at the bottom of the screen
- Or run `Todo Highlighter: Jump to Next` from the Command Palette

Each click moves your cursor to the next keyword in the file. When it reaches the last one it loops back to the beginning.

---

### 🔍 Search for a Custom Word

Need to find every place you used a specific word — like `deprecated`, `password`, or `unsafe`? Use the Search Word feature to highlight it in purple across all open files instantly.

**How to use:**
1. Open the Command Palette (`Ctrl+Shift+P`)
2. Type **Todo Highlighter: Search Word**
3. Enter any word and press Enter

The word will be highlighted in purple everywhere it appears. To clear it, run the command again and leave the input empty.

This is different from regular keywords — it is temporary and meant for quick on-demand searches.

---

### 📋 Summary Panel

The Summary Panel scans your **entire workspace** — every file — and lists every keyword it finds, grouped by file. This is the best way to get a full picture of all pending tasks in your project.

**How to open:**
1. Open the Command Palette (`Ctrl+Shift+P`)
2. Type **Todo Highlighter: Show Summary**

**What you can do in the panel:**
- **Click any row** to jump directly to that file and line
- **Click filter buttons** at the top to show only specific keywords (e.g. only `FIXME`)
- **Click ⟳ Refresh** to re-scan the workspace after making changes
- **View charts** showing which keywords appear most and which files have the most tasks

The panel scans `.ts`, `.js`, `.py`, `.css`, `.html`, `.json`, and `.md` files. It ignores `node_modules` and `out` folders automatically.

---

### 📈 Statistics Charts

Inside the Summary Panel, two bar charts are shown at the top:

- **By Keyword** — shows how many times each keyword appears across the whole project, colored by keyword
- **Top Files** — shows the 5 files with the most keyword matches

This helps you quickly identify which files have the most technical debt or pending work.

---

### ⚠️ Problems Panel Integration

All keywords are also reported as **VS Code info diagnostics**, which means they show up in the Problems panel just like compiler warnings.

**How to open the Problems panel:**
- Press `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac)
- Or go to **View → Problems**

Each entry shows the keyword, the full line of code, and the file it came from. Clicking an entry jumps you straight to that line.

This is useful if you want to review all your TODOs without leaving your normal workflow.

---

## ⌨️ All Commands

| Command | What it does |
|---|---|
| `Todo Highlighter: Show Summary` | Opens the workspace summary panel |
| `Todo Highlighter: Jump to Next` | Jumps to the next keyword in the current file |
| `Todo Highlighter: Search Word` | Highlights a custom word across open files |

Access all commands via the Command Palette (`Ctrl+Shift+P`).

---

## 🛠 All Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `todoHighlighter.keywords` | array | 5 default keywords | List of keywords and their highlight colors |
| `todoHighlighter.commentsOnly` | boolean | `true` | Only highlight inside comments when enabled |
| `todoHighlighter.searchWord` | string | `""` | Custom word to highlight temporarily |

---

## 🎨 Color Reference

Here are some useful colors to copy when adding your own keywords:

```json
"color": "rgba(255, 200, 0, 0.3)"    // yellow
"color": "rgba(255, 80, 80, 0.3)"    // red
"color": "rgba(0, 200, 100, 0.3)"    // green
"color": "rgba(100, 150, 255, 0.3)"  // blue
"color": "rgba(255, 140, 0, 0.3)"    // orange
"color": "rgba(180, 100, 255, 0.3)"  // purple
"color": "rgba(0, 200, 200, 0.3)"    // cyan
"color": "rgba(255, 105, 180, 0.3)"  // pink
```

Increase the last number (opacity) for a stronger highlight, decrease it for a subtler one.

---

## 📄 License

MIT — free to use, modify, and distribute.
