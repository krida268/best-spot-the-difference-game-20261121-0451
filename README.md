[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/krida268/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/krida268/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Twin Vistas — Spot the Difference

Two pictures side by side, and they are not quite the same. **Twin Vistas** is
a complete spot-the-difference game that plays offline in a desktop browser
from its own static files: no build step, no network request, nothing fetched.

Three hand-drawn pictures — **Dawn Harbour**, **The Night Garden** and
**Rocket Yard** — each hide a handful of differences in the right-hand copy: a
sail that vanished, a moon that filled in, a porthole that was never there.
Click a difference in either picture to ring it in both. The counter in the
top-right always tells you how many remain.

## How to play

- Click a spot that differs, in either picture. A green ring marks it in both.
- A wrong click costs 15 points and leaves a red cross for a moment.
- Each find scores 100, and clearing a picture quickly earns a time bonus.
- **H** spends one of three hints per picture (a pulsing amber ring, −25 points).
- **P** pauses. Find every difference in all three pictures to win.

## Run it

```sh
node serve.ts            # serves game/ on http://localhost:8080
```

Then open <http://localhost:8080> in a desktop browser. Or serve the `game/`
folder with any static file server — `game/index.html` is the game.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
into the output folder and writes `dossier.json` with the vendored make.fun
library in `vendor/makefun-game.ts`. The screenshots are real renders of the
game's own `?shot=` scenes, listed in `shots.json`.

## Layout

- `game/index.html` — the page; `game/src/main.js` — state, input, painting
- `game/src/art.js` — the three pictures and their difference spots
- `game/src/shots.js` — the fixed scenes behind the screenshots
- `main.ts` — the hand-in program · `serve.ts` — a local static server

Built for the make.fun bounty
[best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
Try make.fun yourself: <https://make.fun/r/enzt809f> (referral code `enzt809f`).

Licensed under the MIT License — see `LICENSE`.
