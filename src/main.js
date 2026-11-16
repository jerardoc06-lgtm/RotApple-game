/* Rotapple — entry point.

   The game is a set of ES modules loaded straight from the browser by the
   import map in index.html. There is no bundler and no build step, which is
   what makes the source editable from a phone: change a file, reload.

   Boot order matters only in that scene.js patches three.js's vertex shader
   before any material compiles; game.js imports it first for that reason. */

import './game.js';
