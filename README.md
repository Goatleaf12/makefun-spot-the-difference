# Twin Skies — a spot-the-difference balloon festival

[![make.fun bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

**Twin Skies** is an original spot-the-difference game set at a hot-air balloon
festival that runs from dawn to dusk. Every scene shows two near-identical
pictures side by side — the original, and a copy in which **seven things
changed**. Click a difference in either picture to ring it on both; a wrong
click costs six seconds of a clock that never stops.

Three scenes, twenty-one differences in all:

1. **Dawn Meadow** — the balloons rise with the sun.
2. **Lakeside Noon** — still water, bright sails, one lighthouse.
3. **Dusk Finale** — burners lit under a ferris wheel and string lights.

Fair but sneaky differences: a swapped stripe, a vanished basket, a reflection
that is not there, an extra duck. A behaving hint glows over one you have not
found, a 2× loupe magnifies either picture, and the whole game plays by
keyboard alone (arrow keys move, Enter checks, H hints, L loupe, P pause).
Finds chime, misses buzz, and clearing a scene turns the leftover seconds into
bonus points.

## Play it

The game is plain static files under `game/` — no build step, no network:

```sh
node serve.ts          # then open http://localhost:8080
```

## Hand it in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-game.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Entered in the make.fun bounty
[Make the best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
MIT licensed.
