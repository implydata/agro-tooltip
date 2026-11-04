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

import type { AgroTooltipOptions } from './agro-tooltip';
import { initAgroTooltip, positionAgroTooltip } from './agro-tooltip';

function mouse(
  type: string,
  target: EventTarget,
  init: MouseEventInit = { clientX: 100, clientY: 100 },
) {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, ...init }));
}

describe('agro-tooltip', () => {
  let dispose: (() => void) | undefined;

  function init(options?: AgroTooltipOptions) {
    dispose = initAgroTooltip(options);
  }

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="theme" class="theme">
        <button id="plain">Plain</button>
        <div id="outer" data-tooltip="Outer text">
          <span id="inner">Inner</span>
          <span id="empty" data-tooltip="">Empty</span>
        </div>
        <span id="custom" data-hint="Custom text">Custom</span>
      </div>
    `;
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
  });

  const el = (id: string) => document.getElementById(id)!;
  const tooltips = () => document.querySelectorAll<HTMLElement>('.agro-tooltip');

  describe('initAgroTooltip', () => {
    it('shows the tooltip of an element and of its ancestors', () => {
      init();
      mouse('mouseover', el('inner'));
      expect(tooltips()).toHaveLength(1);
      expect(tooltips()[0]!.textContent).toBe('Outer text');
      expect(tooltips()[0]!.parentElement).toBe(document.body);
      expect(tooltips()[0]!.style.position).toBe('fixed');
      expect(tooltips()[0]!.style.pointerEvents).toBe('none');
    });

    it('skips an empty attribute and looks further up', () => {
      init();
      mouse('mouseover', el('empty'));
      expect(tooltips()[0]!.textContent).toBe('Outer text');
    });

    it('positions the tooltip with the offsets', () => {
      init({ offsetX: 5, offsetY: 10 });
      mouse('mouseover', el('outer'), { clientX: 20, clientY: 40 });
      expect(tooltips()[0]!.style.left).toBe('25px');
      expect(tooltips()[0]!.style.top).toBe('50px');
    });

    it('follows the mouse while shown', () => {
      init();
      mouse('mouseover', el('outer'), { clientX: 10, clientY: 10 });
      mouse('mousemove', el('outer'), { clientX: 50, clientY: 60 });
      expect(tooltips()[0]!.style.left).toBe('50px');
      expect(tooltips()[0]!.style.top).toBe('90px');
    });

    it('picks up a changed attribute on the next mouse move', () => {
      init();
      mouse('mouseover', el('outer'));
      el('outer').setAttribute('data-tooltip', 'Changed');
      mouse('mousemove', el('outer'));
      expect(tooltips()[0]!.textContent).toBe('Changed');
    });

    it('hides the tooltip over an element without one', () => {
      init();
      mouse('mouseover', el('outer'));
      mouse('mouseover', el('plain'));
      expect(tooltips()).toHaveLength(0);
    });

    it('hides the tooltip when the mouse leaves the window', () => {
      init();
      mouse('mouseover', el('outer'));
      mouse('mouseout', el('outer'), { relatedTarget: null });
      expect(tooltips()).toHaveLength(0);
    });

    it('keeps the tooltip when the mouse moves between elements', () => {
      init();
      mouse('mouseover', el('outer'));
      mouse('mouseout', el('outer'), { relatedTarget: el('inner') });
      expect(tooltips()).toHaveLength(1);
    });

    it('treats text as text, not HTML', () => {
      init();
      el('outer').setAttribute('data-tooltip', '<b>bold</b>');
      mouse('mouseover', el('outer'));
      expect(tooltips()[0]!.textContent).toBe('<b>bold</b>');
      expect(tooltips()[0]!.querySelector('b')).toBeNull();
    });

    it('uses a custom attribute and class name', () => {
      init({ attribute: 'data-hint', className: 'my-tip' });
      mouse('mouseover', el('custom'));
      expect(document.querySelector('.my-tip')!.textContent).toBe('Custom text');
      mouse('mouseover', el('outer'));
      expect(document.querySelector('.my-tip')).toBeNull();
    });

    it('appends to a container given as a selector', () => {
      init({ container: '.theme' });
      mouse('mouseover', el('outer'));
      expect(tooltips()[0]!.parentElement).toBe(el('theme'));
    });

    it('appends to a container given as an element', () => {
      init({ container: el('theme') });
      mouse('mouseover', el('outer'));
      expect(tooltips()[0]!.parentElement).toBe(el('theme'));
    });

    it('resolves a container function when the tooltip appears', () => {
      const container = jest.fn(() => document.querySelector('.theme'));
      init({ container });
      expect(container).not.toHaveBeenCalled();
      mouse('mouseover', el('outer'));
      expect(tooltips()[0]!.parentElement).toBe(el('theme'));
    });

    it('falls back to the body when the container is missing', () => {
      init({ container: '.does-not-exist' });
      mouse('mouseover', el('outer'));
      expect(tooltips()[0]!.parentElement).toBe(document.body);
    });

    it('stops and removes the tooltip when disposed', () => {
      init();
      mouse('mouseover', el('outer'));
      dispose!();
      dispose = undefined;
      expect(tooltips()).toHaveLength(0);
      mouse('mouseover', el('outer'));
      expect(tooltips()).toHaveLength(0);
    });
  });

  describe('positionAgroTooltip', () => {
    it('keeps the tooltip inside the window', () => {
      const tip = document.createElement('div');
      Object.defineProperty(tip, 'offsetWidth', { value: 100 });
      Object.defineProperty(tip, 'offsetHeight', { value: 20 });
      positionAgroTooltip(tip, window.innerWidth - 10, window.innerHeight - 5);
      expect(tip.style.left).toBe(`${window.innerWidth - 100}px`);
      expect(tip.style.top).toBe(`${window.innerHeight - 20}px`);

      positionAgroTooltip(tip, -50, -50, 0, 0);
      expect(tip.style.left).toBe('0px');
      expect(tip.style.top).toBe('0px');
    });
  });
});
