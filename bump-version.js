#!/usr/bin/env node
/**
 * bump-version.js
 * Roda automaticamente antes de cada `firebase deploy` (via npm script).
 *
 * O que faz:
 *  1. Lê version.json e incrementa o patch (1.0.0 → 1.0.1 → 1.0.2 ...)
 *  2. Atualiza o CACHE_NAME no sw.js com a nova versão
 *  3. Injeta (ou atualiza) um rodapé de versão em todos os arquivos HTML
 *  4. Salva a nova versão em version.json
 */

const fs   = require('fs');
const path = require('path');

// ── Configuração ─────────────────────────────────────────────────────────────

const PUBLIC_DIR = path.join(__dirname, 'public');
const HTML_FILES = ['index.html', 'login.html', 'trocas.html', '404.html'];

// ── 1. Lê e incrementa a versão ──────────────────────────────────────────────

const versionFile = path.join(__dirname, 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));

let [major, minor, patch] = versionData.version.split('.').map(Number);
patch += 1;
const newVersion = `${major}.${minor}.${patch}`;

console.log(`\n🚀 Bump de versão: ${versionData.version} → ${newVersion}\n`);

// ── 2. Atualiza CACHE_NAME no sw.js ──────────────────────────────────────────

const swPath = path.join(PUBLIC_DIR, 'sw.js');

if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    swContent = swContent.replace(
        /const CACHE_NAME\s*=\s*['"][^'"]*['"]/,
        `const CACHE_NAME = 'figurinhas-bohm-v${newVersion}'`
    );
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log(`✅ sw.js  → CACHE_NAME = 'figurinhas-bohm-v${newVersion}'`);
} else {
    console.warn(`⚠️  sw.js não encontrado em ${swPath}`);
}

// ── 3. Injeta rodapé de versão nos HTMLs ─────────────────────────────────────

const FOOTER_START = '<!-- VERSION_FOOTER_START -->';
const FOOTER_END   = '<!-- VERSION_FOOTER_END -->';

const now = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit'
});

function makeFooter(color) {
    return `${FOOTER_START}
<div style="text-align:center; padding:14px 0 4px; font-size:11px; color:${color}; letter-spacing:0.04em; user-select:none;">
    Figurinhas Bohm &nbsp;•&nbsp; v${newVersion} &nbsp;•&nbsp; ${now}
</div>
${FOOTER_END}`;
}

HTML_FILES.forEach(file => {
    const filePath = path.join(PUBLIC_DIR, file);

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  ${file} não encontrado — pulando.`);
        return;
    }

    // Lê normalizando para LF para que os replaces funcionem
    // independente do sistema operacional (CRLF no Windows, LF no Linux/Mac)
    let html = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

    const isLogin = file === 'login.html';
    const color   = isLogin ? '#999' : '#444';

    if (html.includes(FOOTER_START)) {
        // Rodapé já existe → só atualiza
        const regex = new RegExp(FOOTER_START + '[\\s\\S]*?' + FOOTER_END, 'g');
        html = html.replace(regex, makeFooter(color));
        console.log(`🔄 ${file}  → rodapé atualizado`);
    } else {
        if (isLogin) {
            // Insere dentro do .card, depois da div.suporte e antes do </div> que fecha o card,
            // que por sua vez vem antes da tag <script type="module">
            // Estrutura esperada no login.html:
            //   <div class="suporte">...</div>
            //   </div>          ← fecha o .card
            //   <script ...>
            const anchor = '</div>\n<script type="module">';
            if (html.includes(anchor)) {
                html = html.replace(
                    anchor,
                    `</div>\n\n${makeFooter(color)}\n\n<script type="module">`
                );
            } else {
                // Fallback: insere antes de </body>
                html = html.replace('</body>', `\n${makeFooter(color)}\n</body>`);
            }
        } else {
            html = html.replace('</body>', `\n${makeFooter(color)}\n</body>`);
        }
        console.log(`➕ ${file}  → rodapé inserido`);
    }

    fs.writeFileSync(filePath, html, 'utf8');
});

// ── 4. Salva a nova versão ────────────────────────────────────────────────────

fs.writeFileSync(versionFile, JSON.stringify({ version: newVersion }, null, 2), 'utf8');
console.log(`\n📦 version.json → ${newVersion}`);
console.log(`\n✅ Tudo pronto! Iniciando firebase deploy...\n`);