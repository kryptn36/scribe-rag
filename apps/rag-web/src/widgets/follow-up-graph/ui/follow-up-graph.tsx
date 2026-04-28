'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  TreeStructure,
  List,
  DotsSixVertical,
  LinkSimple,
  LinkBreak,
} from '@phosphor-icons/react';
import { Reorder, useDragControls } from 'motion/react';
import { toast } from 'sonner';

import { Badge } from '@/shared/ui/components/badge';
import { Button } from '@/shared/ui/components/button';
import { ScrollArea } from '@/shared/ui/components/scroll-area';

import type { FollowUpWithDeps } from '@/features/process-meeting';
import {
  updateFollowUpStatus,
  reorderFollowUps,
  addFollowUpDependency,
  removeFollowUpDependency,
} from '@/features/process-meeting';

import { FlowGraphView } from './flow-graph-view';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  in_progress: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  medium: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  high: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const NEXT_STATUS: Record<string, 'pending' | 'in_progress' | 'completed'> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
};

// ─── List View (Drag & Drop) ─────────────────────────────────────────────────

function ListView({
  items,
  linkingFrom,
  onStartLink,
  onCompleteLink,
  onRemoveLink,
  onCycleStatus,
  onReorder,
}: {
  items: FollowUpWithDeps[];
  linkingFrom: string | null;
  onStartLink: (id: string) => void;
  onCompleteLink: (targetId: string) => void;
  onRemoveLink: (sourceId: string, targetId: string) => void;
  onCycleStatus: (id: string) => void;
  onReorder: (newItems: FollowUpWithDeps[]) => void;
}) {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      as="div"
      className="space-y-2"
      layoutScroll
    >
      {items.map((item, index) => (
        <ListItem
          key={item.id}
          item={item}
          index={index}
          items={items}
          linkingFrom={linkingFrom}
          onStartLink={onStartLink}
          onCompleteLink={onCompleteLink}
          onRemoveLink={onRemoveLink}
          onCycleStatus={onCycleStatus}
        />
      ))}
    </Reorder.Group>
  );
}

function ListItem({
  item,
  index,
  items,
  linkingFrom,
  onStartLink,
  onCompleteLink,
  onRemoveLink,
  onCycleStatus,
}: {
  item: FollowUpWithDeps;
  index: number;
  items: FollowUpWithDeps[];
  linkingFrom: string | null;
  onStartLink: (id: string) => void;
  onCompleteLink: (targetId: string) => void;
  onRemoveLink: (sourceId: string, targetId: string) => void;
  onCycleStatus: (id: string) => void;
}) {
  const dragControls = useDragControls();
  const isLinking = linkingFrom === item.id;
  const isLinkTarget = linkingFrom !== null && linkingFrom !== item.id;

  return (
    <Reorder.Item
      value={item}
      as="div"
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        cursor: 'grabbing',
        zIndex: 50,
      }}
      animate={{
        scale: 1,
        boxShadow: '0 0 0 rgba(0,0,0,0)',
      }}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        group rounded-lg border p-3 transition-colors
        ${isLinking ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/30' : 'border-white/5 bg-background/40 hover:border-white/10'}
        ${isLinkTarget ? 'cursor-pointer border-dashed border-primary/40 hover:border-primary/60 hover:bg-primary/5' : ''}
      `}
      onClick={() => isLinkTarget && onCompleteLink(item.id)}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Drag handle */}
        <div
          className="mt-1 shrink-0 cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground transition-colors active:cursor-grabbing"
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
        >
          <DotsSixVertical size={16} weight="bold" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-muted-foreground text-xs font-mono">#{index + 1}</span>
            <span className="text-foreground text-sm font-medium truncate">{item.title}</span>
          </div>
          {item.description && (
            <p className="text-muted-foreground text-xs line-clamp-2 mt-0.5">{item.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <button onClick={() => onCycleStatus(item.id)}>
              <Badge variant="outline" className={`text-[10px] cursor-pointer transition-colors ${STATUS_COLORS[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </Badge>
            </button>
            <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[item.priority]}`}>
              {item.priority}
            </Badge>
            {item.dependsOn.length > 0 && (
              <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                {item.dependsOn.length} dep{item.dependsOn.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {/* Show dependency links */}
          {item.dependsOn.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.dependsOn.map((depId) => {
                const dep = items.find((it) => it.id === depId);
                if (!dep) return null;
                return (
                  <button
                    key={depId}
                    onClick={(e) => { e.stopPropagation(); onRemoveLink(item.id, depId); }}
                    className="flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title={`Remove dependency on "${dep.title}"`}
                  >
                    <LinkBreak size={10} />
                    {dep.title.slice(0, 20)}{dep.title.length > 20 ? '…' : ''}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button
          className="mt-1 shrink-0 text-muted-foreground hover:text-primary p-0.5 transition-colors"
          onClick={(e) => { e.stopPropagation(); onStartLink(item.id); }}
          title="Link dependency"
        >
          <LinkSimple size={14} />
        </button>
      </div>
    </Reorder.Item>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface FollowUpGraphProps {
  meetingId: string;
  initialItems: FollowUpWithDeps[];
}

export function FollowUpGraph({ meetingId, initialItems }: FollowUpGraphProps) {
  const [items, setItems] = useState(initialItems);
  const [view, setView] = useState<'graph' | 'list'>('list');
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleCycleStatus = useCallback(async (id: string) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const newStatus = NEXT_STATUS[item.status];
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: newStatus } : it)));
    try {
      await updateFollowUpStatus(id, newStatus);
    } catch {
      toast.error('Failed to update status');
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: item.status } : it)));
    }
  }, [items]);

  const handleStartLink = useCallback((id: string) => {
    setLinkingFrom((prev) => (prev === id ? null : id));
  }, []);

  const handleCompleteLink = useCallback(async (targetId: string) => {
    if (!linkingFrom || linkingFrom === targetId) return;
    setLinkingFrom(null);

    // Optimistic update
    setItems((prev) =>
      prev.map((it) =>
        it.id === linkingFrom
          ? { ...it, dependsOn: [...it.dependsOn, targetId] }
          : it.id === targetId
            ? { ...it, dependedBy: [...it.dependedBy, linkingFrom] }
            : it
      )
    );

    try {
      await addFollowUpDependency(linkingFrom, targetId);
      toast.success('Dependency added');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add dependency');
      setItems(initialItems); // rollback
    }
  }, [linkingFrom, initialItems]);

  const handleRemoveLink = useCallback(async (sourceId: string, targetId: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === sourceId
          ? { ...it, dependsOn: it.dependsOn.filter((d) => d !== targetId) }
          : it.id === targetId
            ? { ...it, dependedBy: it.dependedBy.filter((d) => d !== sourceId) }
            : it
      )
    );

    try {
      await removeFollowUpDependency(sourceId, targetId);
      toast.success('Dependency removed');
    } catch {
      toast.error('Failed to remove dependency');
      setItems(initialItems);
    }
  }, [initialItems]);

  const handleReorder = useCallback((newItems: FollowUpWithDeps[]) => {
    setItems(newItems);
  }, []);

  // Persist reorder after drag ends (debounced to avoid firing mid-drag)
  const persistOrderRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOrderRef = useRef<string[]>(initialItems.map((it) => it.id));

  useEffect(() => {
    const currentOrder = items.map((it) => it.id);
    const isSame = currentOrder.length === prevOrderRef.current.length &&
      currentOrder.every((id, i) => id === prevOrderRef.current[i]);
    if (isSame) return;

    if (persistOrderRef.current) clearTimeout(persistOrderRef.current);
    persistOrderRef.current = setTimeout(async () => {
      prevOrderRef.current = currentOrder;
      try {
        await reorderFollowUps(meetingId, currentOrder);
      } catch {
        toast.error('Failed to save order');
        setItems(initialItems);
      }
    }, 600);

    return () => {
      if (persistOrderRef.current) clearTimeout(persistOrderRef.current);
    };
  }, [items, meetingId, initialItems]);

  const hasDeps = items.some((it) => it.dependsOn.length > 0 || it.dependedBy.length > 0);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{items.length} follow-up{items.length !== 1 ? 's' : ''}</span>
          {hasDeps && (
            <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
              <TreeStructure size={10} className="mr-1" />
              Has dependencies
            </Badge>
          )}
          {linkingFrom && (
            <Badge variant="outline" className="text-[10px] bg-primary/15 text-primary border-primary/30 animate-pulse">
              Click a target to link…
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView('list')}
            title="List view"
          >
            <List size={14} />
          </Button>
          <Button
            variant={view === 'graph' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView('graph')}
            title="Graph view"
          >
            <TreeStructure size={14} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === 'graph' ? (
        <div className="flex-1 min-h-0 relative">
          {linkingFrom && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
              <button
                onClick={() => setLinkingFrom(null)}
                className="rounded-lg border border-dashed border-muted-foreground/30 bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors"
              >
                Cancel linking
              </button>
            </div>
          )}
          <FlowGraphView
            items={items}
            linkingFrom={linkingFrom}
            onStartLink={handleStartLink}
            onCompleteLink={handleCompleteLink}
            onRemoveLink={handleRemoveLink}
            onCycleStatus={handleCycleStatus}
          />
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4">
            {linkingFrom && (
              <button
                onClick={() => setLinkingFrom(null)}
                className="mb-3 w-full rounded border border-dashed border-muted-foreground/30 py-1.5 text-xs text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors"
              >
                Cancel linking
              </button>
            )}
            <ListView
              items={items}
              linkingFrom={linkingFrom}
              onStartLink={handleStartLink}
              onCompleteLink={handleCompleteLink}
              onRemoveLink={handleRemoveLink}
              onCycleStatus={handleCycleStatus}
              onReorder={handleReorder}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
