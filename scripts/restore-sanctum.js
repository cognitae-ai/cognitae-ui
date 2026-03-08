import fs from 'fs';

const v95Path = 'f:/Cognitae Github - 0803/Cognitae/SanctumOS/sanctum-v9.5.jsx';
const shellPath = 'f:/Cognitae Github - 0803/Cognitae/cognitae-ui/src/sanctum/components/layout/SanctumShell.jsx';

const v95 = fs.readFileSync(v95Path, 'utf8').split('\n');
const shell = fs.readFileSync(shellPath, 'utf8').split('\n');

const printSessionChunk = v95.slice(401, 443).join('\n');
const demoArtChunk = v95.slice(455, 463).join('\n');

const imports = shell.slice(0, 12).join('\n');
const shellTop = shell.slice(12, 197).join('\n');
const missingLogic = v95.slice(843, 1318).join('\n');

const finalCode = `${imports}\n\n${printSessionChunk}\n\n${demoArtChunk}\n\n${shellTop}\n${missingLogic}\n`;
fs.writeFileSync(shellPath, finalCode);
console.log('Restored SanctumShell.jsx successfully!');
