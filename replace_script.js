const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFilesWithLocalhost(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findFilesWithLocalhost(fullPath, fileList);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('http://localhost:5000')) {
                fileList.push(fullPath);
            }
        }
    }
    return fileList;
}

const files = findFilesWithLocalhost(srcDir);

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Calculate relative path to config.js
    const configPath = path.join(srcDir, 'config.js');
    let relativePath = path.relative(path.dirname(file), configPath).replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
    }
    relativePath = relativePath.replace(/\.js$/, '');

    // Add import if not exists
    if (!content.includes('API_BASE_URL')) {
        const importStatement = `import { API_BASE_URL } from '${relativePath}';\n`;

        // Find where to insert (after last import, or at top)
        const importLines = [];
        const otherLines = [];
        const lines = content.split('\n');
        let insideImport = false;
        let lastImportLineIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ') && !lines[i].includes('} from')) {
                if (!lines[i].includes(';')) {
                    insideImport = true;
                }
                lastImportLineIndex = i;
            } else if (lines[i].trim().startsWith('import ')) {
                lastImportLineIndex = i;
            } else if (insideImport) {
                lastImportLineIndex = i;
                if (lines[i].includes(';')) {
                    insideImport = false;
                }
            }
        }

        if (lastImportLineIndex !== -1) {
            lines.splice(lastImportLineIndex + 1, 0, importStatement.trim());
            content = lines.join('\n');
        } else {
            content = importStatement + content;
        }
    }

    // Handle template literals: `http://localhost:5000/api/...`
    // Replace `http://localhost:5000 with `${API_BASE_URL}
    content = content.replace(/`http:\/\/localhost:5000/g, '`${API_BASE_URL}');

    // Handle double quotes: "http://localhost:5000/api/..." -> `${API_BASE_URL}/api/...`
    // Here we only capture up to the next double quote.
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${API_BASE_URL}$1`');

    // Handle single quotes: 'http://localhost:5000/api/...' -> `${API_BASE_URL}/api/...`
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${API_BASE_URL}$1`');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
}
