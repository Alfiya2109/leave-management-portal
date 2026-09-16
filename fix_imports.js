const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFilesWithImportAtBottom(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findFilesWithImportAtBottom(fullPath, fileList);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.match(/export default \w+;?\s+import \{ API_BASE_URL/)) {
                fileList.push(fullPath);
            } else if (content.match(/export default \w+\s*\n*import \{ API_BASE_URL/)) {
                fileList.push(fullPath);
            }
        }
    }
    return fileList;
}

const files = findFilesWithImportAtBottom(srcDir);

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let match = content.match(/import \{ API_BASE_URL \} from '[^']+';\n?/);
    if (match) {
        // remove from wherever it is
        content = content.replace(match[0], '');

        // Find last import
        const lines = content.split('\n');
        let lastImportLineIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ')) {
                lastImportLineIndex = i;
            }
        }

        lines.splice(lastImportLineIndex + 1, 0, match[0].trim());
        content = lines.join('\n');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed import in ${file}`);
    }
}
