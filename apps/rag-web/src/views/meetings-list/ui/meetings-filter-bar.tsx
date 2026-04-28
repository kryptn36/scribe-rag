'use client';

import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import React from 'react';

import { Input } from '@/shared/ui/components/input';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/components/tabs';

interface MeetingsFilterBarProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function MeetingsFilterBar({ search, status, onSearchChange, onStatusChange }: MeetingsFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md">
        <MagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" size={18} />
        <Input
          className="bg-background/40 border-white/10 pl-9"
          placeholder="Search meetings by title..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Tabs defaultValue="all" value={status} onValueChange={onStatusChange} className="w-full sm:w-auto">
        <TabsList className="bg-background/40 border-white/5 grid w-full grid-cols-4 sm:flex sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Processed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
