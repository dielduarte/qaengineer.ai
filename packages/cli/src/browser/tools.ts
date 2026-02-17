import { tool } from 'ai';
import { z } from 'zod';
import { exec } from 'browser/executor.js';
import type { ToolSet } from 'ai';

function resultString(parsed: unknown): string {
  if (typeof parsed === 'string') return parsed;
  return JSON.stringify(parsed, null, 2);
}

export function createBrowserTools(): ToolSet {
  // ── Navigation ──────────────────────────────────────────────

  const browser_open = tool({
    description:
      'Navigate the browser to a URL. Use this as the first action to open a page.',
    inputSchema: z.object({
      url: z.string().describe('The URL to navigate to'),
    }),
    execute: async ({ url }) => {
      const { parsed } = await exec(['open', url]);
      return resultString(parsed);
    },
  });

  const browser_back = tool({
    description:
      'Go back to the previous page in browser history.',
    inputSchema: z.object({}),
    execute: async () => {
      const { parsed } = await exec(['back']);
      return resultString(parsed);
    },
  });

  const browser_forward = tool({
    description:
      'Go forward to the next page in browser history.',
    inputSchema: z.object({}),
    execute: async () => {
      const { parsed } = await exec(['forward']);
      return resultString(parsed);
    },
  });

  const browser_reload = tool({
    description: 'Reload the current page.',
    inputSchema: z.object({}),
    execute: async () => {
      const { parsed } = await exec(['reload']);
      return resultString(parsed);
    },
  });

  // ── Observation ─────────────────────────────────────────────

  const browser_snapshot = tool({
    description:
      'Get the accessibility tree of the current page. Returns element refs (like @e1, @e2) that you can use to interact with elements. Always call this first to understand the page structure before interacting.',
    inputSchema: z.object({
      interactive: z
        .boolean()
        .optional()
        .describe(
          'If true, only return interactive elements (buttons, inputs, links)',
        ),
    }),
    execute: async ({ interactive }) => {
      const args = ['snapshot'];
      if (interactive) args.push('-i');
      const { parsed } = await exec(args);
      return resultString(parsed);
    },
  });

  const browser_screenshot = tool({
    description: 'Take a screenshot of the current page.',
    inputSchema: z.object({
      path: z
        .string()
        .optional()
        .describe('File path to save the screenshot'),
      full: z
        .boolean()
        .optional()
        .describe('If true, capture the full page'),
    }),
    execute: async ({ path, full }) => {
      const args = ['screenshot'];
      if (path) args.push(path);
      if (full) args.push('--full');
      const { parsed } = await exec(args);
      return resultString(parsed);
    },
  });

  const browser_get_text = tool({
    description: 'Get the text content of an element.',
    inputSchema: z.object({
      selector: z
        .string()
        .describe(
          'Element selector (use @ref from snapshot, e.g. @e1)',
        ),
    }),
    execute: async ({ selector }) => {
      const { parsed } = await exec([
        'get',
        'text',
        selector,
      ]);
      return resultString(parsed);
    },
  });

  const browser_get_title = tool({
    description: 'Get the page title.',
    inputSchema: z.object({}),
    execute: async () => {
      const { parsed } = await exec(['get', 'title']);
      return resultString(parsed);
    },
  });

  const browser_get_url = tool({
    description: 'Get the current page URL.',
    inputSchema: z.object({}),
    execute: async () => {
      const { parsed } = await exec(['get', 'url']);
      return resultString(parsed);
    },
  });

  // ── Interaction ─────────────────────────────────────────────

  const browser_click = tool({
    description: 'Click an element on the page.',
    inputSchema: z.object({
      selector: z
        .string()
        .describe(
          'Element selector (use @ref from snapshot, e.g. @e1)',
        ),
    }),
    execute: async ({ selector }) => {
      const { parsed } = await exec(['click', selector]);
      return resultString(parsed);
    },
  });

  const browser_fill = tool({
    description:
      'Clear a text field and fill it with new text. Use this for input fields.',
    inputSchema: z.object({
      selector: z
        .string()
        .describe(
          'Element selector (use @ref from snapshot, e.g. @e1)',
        ),
      text: z
        .string()
        .describe('Text to fill into the field'),
    }),
    execute: async ({ selector, text }) => {
      const { parsed } = await exec([
        'fill',
        selector,
        text,
      ]);
      return resultString(parsed);
    },
  });

  const browser_type = tool({
    description:
      'Type text into the currently focused element character by character.',
    inputSchema: z.object({
      selector: z
        .string()
        .describe(
          'Element selector (use @ref from snapshot, e.g. @e1)',
        ),
      text: z.string().describe('Text to type'),
    }),
    execute: async ({ selector, text }) => {
      const { parsed } = await exec([
        'type',
        selector,
        text,
      ]);
      return resultString(parsed);
    },
  });

  const browser_press = tool({
    description:
      'Press a keyboard key (e.g. Enter, Tab, Escape, Control+a).',
    inputSchema: z.object({
      key: z
        .string()
        .describe(
          'Key to press (e.g. Enter, Tab, Escape, Control+a)',
        ),
    }),
    execute: async ({ key }) => {
      const { parsed } = await exec(['press', key]);
      return resultString(parsed);
    },
  });

  const browser_hover = tool({
    description: 'Hover over an element.',
    inputSchema: z.object({
      selector: z
        .string()
        .describe(
          'Element selector (use @ref from snapshot, e.g. @e1)',
        ),
    }),
    execute: async ({ selector }) => {
      const { parsed } = await exec(['hover', selector]);
      return resultString(parsed);
    },
  });

  const browser_select = tool({
    description: 'Select an option from a dropdown.',
    inputSchema: z.object({
      selector: z
        .string()
        .describe(
          'Element selector (use @ref from snapshot, e.g. @e1)',
        ),
      value: z.string().describe('Value to select'),
    }),
    execute: async ({ selector, value }) => {
      const { parsed } = await exec([
        'select',
        selector,
        value,
      ]);
      return resultString(parsed);
    },
  });

  const browser_check = tool({
    description: 'Check a checkbox.',
    inputSchema: z.object({
      selector: z
        .string()
        .describe(
          'Element selector (use @ref from snapshot, e.g. @e1)',
        ),
    }),
    execute: async ({ selector }) => {
      const { parsed } = await exec(['check', selector]);
      return resultString(parsed);
    },
  });

  const browser_uncheck = tool({
    description: 'Uncheck a checkbox.',
    inputSchema: z.object({
      selector: z
        .string()
        .describe(
          'Element selector (use @ref from snapshot, e.g. @e1)',
        ),
    }),
    execute: async ({ selector }) => {
      const { parsed } = await exec(['uncheck', selector]);
      return resultString(parsed);
    },
  });

  // ── Scrolling ───────────────────────────────────────────────

  const browser_scroll = tool({
    description: 'Scroll the page in a direction.',
    inputSchema: z.object({
      direction: z
        .enum(['up', 'down', 'left', 'right'])
        .describe('Scroll direction'),
      pixels: z
        .number()
        .optional()
        .describe('Number of pixels to scroll'),
    }),
    execute: async ({ direction, pixels }) => {
      const args = ['scroll', direction];
      if (pixels !== undefined) args.push(String(pixels));
      const { parsed } = await exec(args);
      return resultString(parsed);
    },
  });

  // ── Semantic find ───────────────────────────────────────────

  const browser_find_by_role = tool({
    description:
      'Find an element by its ARIA role and perform an action on it.',
    inputSchema: z.object({
      role: z
        .string()
        .describe(
          'ARIA role (e.g. button, link, textbox, heading)',
        ),
      action: z
        .string()
        .describe(
          'Action to perform (click, fill, hover, etc.)',
        ),
      value: z
        .string()
        .optional()
        .describe(
          'Value for the action (e.g. text to fill)',
        ),
    }),
    execute: async ({ role, action, value }) => {
      const args = ['find', 'role', role, action];
      if (value) args.push(value);
      const { parsed } = await exec(args);
      return resultString(parsed);
    },
  });

  const browser_find_by_text = tool({
    description:
      'Find an element by its text content and perform an action on it.',
    inputSchema: z.object({
      text: z.string().describe('Text to search for'),
      action: z
        .string()
        .describe(
          'Action to perform (click, fill, hover, etc.)',
        ),
    }),
    execute: async ({ text, action }) => {
      const { parsed } = await exec([
        'find',
        'text',
        text,
        action,
      ]);
      return resultString(parsed);
    },
  });

  const browser_find_by_label = tool({
    description:
      'Find an element by its label and perform an action on it.',
    inputSchema: z.object({
      label: z
        .string()
        .describe('Label text to search for'),
      action: z
        .string()
        .describe(
          'Action to perform (click, fill, hover, etc.)',
        ),
      value: z
        .string()
        .optional()
        .describe(
          'Value for the action (e.g. text to fill)',
        ),
    }),
    execute: async ({ label, action, value }) => {
      const args = ['find', 'label', label, action];
      if (value) args.push(value);
      const { parsed } = await exec(args);
      return resultString(parsed);
    },
  });

  // ── Waiting ─────────────────────────────────────────────────

  const browser_wait = tool({
    description:
      'Wait for a condition: element visibility, text appearance, URL match, or a fixed delay in ms.',
    inputSchema: z.object({
      selector: z
        .string()
        .optional()
        .describe(
          'CSS selector or @ref to wait for, or milliseconds as a string for delay',
        ),
      text: z
        .string()
        .optional()
        .describe('Wait for this text to appear on page'),
      url: z
        .string()
        .optional()
        .describe('Wait for the URL to match this pattern'),
      load: z
        .enum(['load', 'domcontentloaded', 'networkidle'])
        .optional()
        .describe('Wait for a specific load state'),
    }),
    execute: async ({ selector, text, url, load }) => {
      const args = ['wait'];
      if (selector) args.push(selector);
      if (text) args.push('--text', text);
      if (url) args.push('--url', url);
      if (load) args.push('--load', load);
      const { parsed } = await exec(args);
      return resultString(parsed);
    },
  });

  // ── State checking ──────────────────────────────────────────

  const browser_is_visible = tool({
    description:
      'Check if an element is visible on the page.',
    inputSchema: z.object({
      selector: z
        .string()
        .describe(
          'Element selector (use @ref from snapshot, e.g. @e1)',
        ),
    }),
    execute: async ({ selector }) => {
      const { parsed } = await exec([
        'is',
        'visible',
        selector,
      ]);
      return resultString(parsed);
    },
  });

  const browser_get_count = tool({
    description:
      'Count the number of elements matching a selector.',
    inputSchema: z.object({
      selector: z
        .string()
        .describe('CSS selector to count'),
    }),
    execute: async ({ selector }) => {
      const { parsed } = await exec([
        'get',
        'count',
        selector,
      ]);
      return resultString(parsed);
    },
  });

  // ── Debugging ───────────────────────────────────────────────

  const browser_evaluate = tool({
    description:
      'Execute JavaScript in the browser and return the result.',
    inputSchema: z.object({
      script: z
        .string()
        .describe('JavaScript code to execute'),
    }),
    execute: async ({ script }) => {
      const { parsed } = await exec(['eval', script]);
      return resultString(parsed);
    },
  });

  const browser_console = tool({
    description:
      'View browser console messages (log, error, warn, info).',
    inputSchema: z.object({}),
    execute: async () => {
      const { parsed } = await exec(['console']);
      return resultString(parsed);
    },
  });

  return {
    browser_open,
    browser_back,
    browser_forward,
    browser_reload,
    browser_snapshot,
    browser_screenshot,
    browser_get_text,
    browser_get_title,
    browser_get_url,
    browser_click,
    browser_fill,
    browser_type,
    browser_press,
    browser_hover,
    browser_select,
    browser_check,
    browser_uncheck,
    browser_scroll,
    browser_find_by_role,
    browser_find_by_text,
    browser_find_by_label,
    browser_wait,
    browser_is_visible,
    browser_get_count,
    browser_evaluate,
    browser_console,
  };
}
