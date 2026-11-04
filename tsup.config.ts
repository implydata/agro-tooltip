/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { copyFileSync } from 'node:fs';

import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    splitting: false,
    sourcemap: true,
    target: 'es2020',
    onSuccess: async () => {
      // The stylesheet ships as plain CSS, so it needs no build step on the consumer's side
      copyFileSync('src/agro-tooltip.css', 'dist/agro-tooltip.css');
    },
  },
  {
    // For a plain <script> tag: exposes the `agroTooltip` global
    entry: { 'agro-tooltip': 'src/index.ts' },
    format: ['iife'],
    globalName: 'agroTooltip',
    minify: true,
    sourcemap: true,
    target: 'es2020',
    outExtension: () => ({ js: '.global.js' }),
  },
]);
