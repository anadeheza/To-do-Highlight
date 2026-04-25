# Todo Highlighter
Todo Highlighter is a VS Code extension that scans your code for keywords like `TODO`, `FIXME`, `HACK`, etc. It highlights them with colors, showing counts in the status bar, and giving you a full workspace summary

## Why This Helps You as a Developer

As a developer, you may leave notes to yourself like `// TODO refactor this` or `// FIXME crashes on null` and then forget about them buried in files you haven't opened in weeks.

With To-do highlighter you see colored highlights when you open a file, the status bar tells you how many pending tasks exist in the current file, the Summary Panel shows the notes through entire project

The features are:
Keyword highlighting
Gutter icons 
Status bar counter 
Jump to next 
Custom search
Summary panel
Statistics
Filter
Problems panel
Comments only mode (to avoid highlighting the code itself)

Once the extension is active it works automatically 
To open the Command Palette:
- `Ctrl+Shift+P` on Windows / Linux
- `Cmd+Shift+P` on Mac

The dfault keywords are TODO, FIXME, HACK, NOTE and WARN but you can customize which words get highlighted and what color they use.

How to open settings:
1. Press `Ctrl+,` (or `Cmd+,` on Mac) to open Settings
2. Search for "Todo Highlighter"
3. Click "Edit in settings.json" under the Keywords section

The color must be in `rgba(red, green, blue, opacity)` format. 

Comments Only Mode

By default the extension only highlights keywords inside comments. You can turn this off to highlight keywords anywhere in your code — including variable names, strings, and function names.

How? Just

1. Open Settings (`Ctrl+,`)
2. Search for "Todo Highlighter"
3. Check or uncheck "Comments Only"

Or edit `settings.json` directly setting it to true or false

If you need to find every place you used a specific word, you can use the Search Word feature to highlight it.

How to use:
1. Open the Command Palette (`Ctrl+Shift+P`)
2. Type "Todo Highlighter: Search Word"
3. Enter any word and press Enter

The word will be highlighted temporarily in purple everywhere it appears. To clear it, run the command again and leave the input empty.

The Summary Panel scans very file and lists every keyword it finds, grouped by file. 
How to open:
1. Open the Command Palette (`Ctrl+Shift+P`)
2. Type **Todo Highlighter: Show Summary**

Here you can
- Click any row to jump to that file and line
- Click filter buttons at the top to show only specific keywords (e.g. only `FIXME`)
- Click ⟳ Refresh
- View charts showing which keywords appear most and which files have the most tasks

The panel scans `.ts`, `.js`, `.py`, `.css`, `.html`, `.json`, and `.md` files. It ignores `node_modules` and `out` folders automatically.

Inside the Summary Panel, two bar charts are shown at the top as statistics:

- By Keyword: shows how many times each keyword appears across the whole project, colored by keyword
- Top Files: shows the 5 files with the most keyword matches

All keywords are also reported as "VS Code info diagnostics", so they show up in the Problems panel.

## Commands

| `Todo Highlighter: Show Summary` : Opens the workspace summary panel |
| `Todo Highlighter: Jump to Next` : Jumps to the next keyword in the current file |
| `Todo Highlighter: Search Word` : Highlights a custom word across open files |

Command Palette (`Ctrl+Shift+P`).
