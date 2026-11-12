import type { Composition, Project } from '@ograf-editor/scene-model';
import { useEffect, useState } from 'react';
import { createCertifiedProjectPackage } from '../state/exportPackage';

export function ExportToPI({
  project,
  composition,
  disabled,
}: {
  project: Project;
  composition: Composition;
  disabled?: boolean;
}) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 10_000);
    return () => window.clearTimeout(timer);
  }, [error]);

  const isInsideIframe = typeof window !== 'undefined' && !!window.parent && window.parent !== window;

  if (!isInsideIframe) {
    return null;
  }

  const sendBlobToParent = (blob: Blob, filename: string) => {
    const targetWindow = window.parent && window.parent !== window ? window.parent : null;
    const targetOrigin = (() => {
      try {
        return document.referrer ? new URL(document.referrer).origin : '*';
      } catch {
        return '*';
      }
    })();

    if (!targetWindow) {
      setError(
        'This preview is not running inside an iframe, so there is no parent window to notify.',
      );
      return;
    }

    console.log('post message ', filename);

    targetWindow.postMessage(
      {
        type: 'UPLOAD_OGRAF_TEMPLATE',
        filename,
        blob,
      },
      targetOrigin,
    );
  };

  const exportToPI = async () => {
    if (exporting) return;
    setExporting(true);
    setError(null);
    try {
      const { blob } = await createCertifiedProjectPackage(project, composition);
      sendBlobToParent(blob, `${project.name || 'untitled'}.ograf.zip`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not export certified package.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div>
        <button type="button" disabled={disabled || exporting} onClick={() => void exportToPI()}>
          {exporting ? 'Exporting…' : 'Export To PI'}
        </button>
        <p>
          {error ? (
            <span role="alert" style={{ color: 'red' }}>
              {error}
            </span>
          ) : null}
        </p>
      </div>
    </>
  );
}
