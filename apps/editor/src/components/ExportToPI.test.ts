import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExportToPI } from './ExportToPI';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ExportToPI', () => {
  it('renders nothing when the editor is not embedded in an iframe', () => {
    vi.stubGlobal('window', { parent: null });

    const html = renderToStaticMarkup(
      createElement(ExportToPI, { project: {} as any, composition: {} as any }),
    );

    expect(html).toBe('');
  });

  it('renders the export action when the editor is embedded in an iframe', () => {
    vi.stubGlobal('window', { parent: { postMessage: vi.fn() } });

    const html = renderToStaticMarkup(
      createElement(ExportToPI, { project: {} as any, composition: {} as any }),
    );

    expect(html).toContain('Export To PI');
  });
});
