import type { UsePhysicsBubblesAPI } from '@/hooks/use-physics-bubbles';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface DebugPanelProps {
  physics: UsePhysicsBubblesAPI;
}

export function DebugPanel({ physics }: DebugPanelProps) {
  const [bodyCount, setBodyCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBodyCount(physics.getBodyCount());
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [physics]);

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {visible && (
        <div className="min-w-40 rounded-xl bg-slate-900/50 p-3 font-mono text-xs text-white">
          <div className="text-center">Bodies: {bodyCount}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => physics.debugWorld()}
            className="mt-2.5"
          >
            Log World Snapshot
          </Button>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={() => setVisible((v) => !v)}>
        {visible ? 'Hide Debug' : 'Show Debug'}
      </Button>
    </div>
  );
}
