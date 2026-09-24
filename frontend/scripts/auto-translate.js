const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Function to recursively find all JSX files
function getJsxFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getJsxFiles(filePath, fileList);
        } else if (filePath.endsWith('.jsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// Function to transform a single file
function transformFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
    
    try {
        const ast = babel.parse(code, {
            sourceType: 'module',
            plugins: ['jsx']
        });

        let needsImport = false;
        let hasUseTranslation = false;
        let modified = false;
        
        traverse(ast, {
            // Check for useTranslation import
            ImportDeclaration(path) {
                if (path.node.source.value === 'react-i18next') {
                    needsImport = true;
                }
            },
            
            // Find hardcoded JSX text
            JSXText(path) {
                const text = path.node.value;
                // Ignore empty strings, whitespace, or pure symbols
                if (text.trim().length > 1 && /[a-zA-Z]/.test(text)) {
                    const trimmedText = text.trim();
                    const key = trimmedText.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
                    
                    // Replace text with {t('key')}
                    const tCall = t.callExpression(t.identifier('t'), [t.stringLiteral(key)]);
                    const jsxExpr = t.jsxExpressionContainer(tCall);
                    
                    path.replaceWith(jsxExpr);
                    modified = true;
                }
            }
        });

        if (modified) {
            const output = generate(ast, {}, code);
            fs.writeFileSync(filePath, output.code);
            console.log(`Updated: ${filePath}`);
        }
        
    } catch (err) {
        console.error(`Error parsing ${filePath}:`, err.message);
    }
}

const srcDir = path.join(__dirname, '../src');
const files = getJsxFiles(srcDir);

console.log(`Found ${files.length} JSX files. Modifying AST...`);
// NOTE: We recommend running this on a small test folder first!
// For example, change getJsxFiles(srcDir) to getJsxFiles(path.join(srcDir, 'components/sidebar'))

files.forEach(transformFile);
console.log("Done!");
