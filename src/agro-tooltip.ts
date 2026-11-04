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

export const DEFAULT_ATTRIBUTE = 'data-tooltip';
export const DEFAULT_CLASS_NAME = 'agro-tooltip';
export const DEFAULT_OFFSET_X = 0;
export const DEFAULT_OFFSET_Y = 30;

/**
 * Where the tooltip element gets appended: an element, a CSS selector, or a function returning an
 * element. It is resolved each time a tooltip appears, so it can name an element that does not
 * exist yet when `initAgroTooltip` is called. Falls back to `document.body` when it resolves to
 * nothing.
 */
export type AgroTooltipContainer = Element | string | (() => Element | null | undefined);

export interface AgroTooltipOptions {
  /** The attribute holding the tooltip text. Defaults to `data-tooltip`. */
  attribute?: string;

  /** Where to append the tooltip element. Defaults to `document.body`. */
  container?: AgroTooltipContainer;

  /** The class put on the tooltip element. Defaults to `agro-tooltip`. */
  className?: string;

  /** Horizontal distance from the mouse pointer, in pixels. Defaults to 0. */
  offsetX?: number;

  /** Vertical distance from the mouse pointer, in pixels. Defaults to 30. */
  offsetY?: number;

  /** The document to listen on. Defaults to the global `document`. */
  document?: Document;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function findTooltipText(target: EventTarget | null, attribute: string): string | undefined {
  // Duck typed rather than `instanceof Element` so that it works across frames
  let e = target && 'getAttribute' in target ? (target as Element) : null;
  while (e) {
    const text = e.getAttribute(attribute);
    if (text) return text;
    e = e.parentElement;
  }
  return;
}

function resolveContainer(container: AgroTooltipContainer | undefined, doc: Document): Element {
  let element: Element | null | undefined;
  if (typeof container === 'string') {
    element = doc.querySelector(container);
  } else if (typeof container === 'function') {
    element = container();
  } else {
    element = container;
  }
  return element ?? doc.body;
}

/**
 * Places a tooltip element near the given viewport (client) coordinates, keeping it inside the
 * window. The element is expected to be `position: fixed`.
 */
export function positionAgroTooltip(
  tooltip: HTMLElement,
  clientX: number,
  clientY: number,
  offsetX = DEFAULT_OFFSET_X,
  offsetY = DEFAULT_OFFSET_Y,
): void {
  const win = tooltip.ownerDocument.defaultView ?? window;
  tooltip.style.left = `${clamp(clientX + offsetX, 0, win.innerWidth - tooltip.offsetWidth)}px`;
  tooltip.style.top = `${clamp(clientY + offsetY, 0, win.innerHeight - tooltip.offsetHeight)}px`;
}

/**
 * Starts showing a tooltip next to the mouse for every element (or descendant of an element) that
 * has the tooltip attribute. Returns a function that stops it and removes any visible tooltip.
 */
export function initAgroTooltip(options: AgroTooltipOptions = {}): () => void {
  const {
    attribute = DEFAULT_ATTRIBUTE,
    container,
    className = DEFAULT_CLASS_NAME,
    offsetX = DEFAULT_OFFSET_X,
    offsetY = DEFAULT_OFFSET_Y,
    document: doc = document,
  } = options;

  let tooltip: HTMLDivElement | undefined;

  const hide = () => {
    if (!tooltip) return;
    doc.removeEventListener('mousemove', handleMouse);
    tooltip.remove();
    tooltip = undefined;
  };

  function handleMouse(event: MouseEvent) {
    const text = findTooltipText(event.target, attribute);
    if (!text) {
      hide();
      return;
    }

    if (!tooltip) {
      tooltip = doc.createElement('div');
      tooltip.className = className;
      // Set here so that the tooltip behaves even before (or without) the stylesheet
      tooltip.style.position = 'fixed';
      tooltip.style.pointerEvents = 'none';
      resolveContainer(container, doc).appendChild(tooltip);
      doc.addEventListener('mousemove', handleMouse);
    }
    if (tooltip.textContent !== text) {
      tooltip.textContent = text;
    }

    positionAgroTooltip(tooltip, event.clientX, event.clientY, offsetX, offsetY);
  }

  // The mouse left the window
  const handleMouseOut = (event: MouseEvent) => {
    if (!event.relatedTarget) hide();
  };

  doc.addEventListener('mouseover', handleMouse);
  doc.addEventListener('mouseout', handleMouseOut);

  return () => {
    doc.removeEventListener('mouseover', handleMouse);
    doc.removeEventListener('mouseout', handleMouseOut);
    hide();
  };
}
