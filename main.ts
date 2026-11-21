// Twin Skies — the hand-in program (Node 22, standard library only).
//
// The game itself is the game/ folder beside this file: plain static files a
// desktop browser plays offline, no build step and no network request. This
// program delivers it: it copies game/ and screenshots/ into the output
// directory and writes dossier.json there with buildDossier from the vendored
// make.fun library, byte for byte as the scorer will rebuild it.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps below are the gate's own (see the kit's RULES.txt): the dossier text
// is capped at 160 KiB, screenshots at 4 files of 256 KiB, game/ at 993 entries
// and 48 MiB with no path over 1,000 bytes. Twin Skies sits far inside all of
// them, but the numbers are passed exactly as the scorer passes them so the
// dossier written here is the dossier the scorer rebuilds.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
