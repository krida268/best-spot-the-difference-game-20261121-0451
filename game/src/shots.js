// The three staged scenes behind ?shot=start|play|end. Each one puts the
// real game state into a fixed position — nothing here draws anything of its
// own, so a screenshot is the game itself, exactly as a player would see it:
// the start shows the title over the first picture, the play scene has three
// differences ringed and five still hiding, and the end scene is the victory
// card over the last picture with every spot ringed.

import { LEVELS } from './art.js';

export function stageShot(name, game) {
  game.anim = 1.3; // a fixed animation clock, so every render is identical
  if (name === 'play') {
    game.screen = 'play';
    game.levelIndex = 0;
    game.found = new Set(['sun', 'birds', 'sail']);
    game.misses = 1;
    game.time = 37;
    game.score = 285;
    return;
  }
  if (name === 'end') {
    game.screen = 'won';
    game.levelIndex = LEVELS.length - 1;
    game.found = new Set(LEVELS[game.levelIndex].diffs.map((d) => d.id));
    game.totalTime = 252;
    game.score = 2140;
    return;
  }
  // Anything else is the start scene: the title over an untouched picture.
  game.screen = 'title';
  game.levelIndex = 0;
  game.found = new Set();
}
