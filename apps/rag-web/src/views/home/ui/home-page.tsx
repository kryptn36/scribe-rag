'use client';

import { FileText, LockKey, MagnifyingGlass } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/shared/ui/components/button';
import { InteractiveHoverButton } from '@/shared/ui/components/interactive-hover-button';
import { MagicCard } from '@/shared/ui/components/magic-card';
import { RetroGrid } from '@/shared/ui/components/retro-grid';

export function HomePage() {
  return (
    <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-0">
      <RetroGrid className="fixed inset-0 z-0" />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 space-y-6 text-center lg:max-w-2xl lg:text-left"
        >
          <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium backdrop-blur-sm">
            <span className="bg-primary mr-2 flex h-2 w-2 animate-pulse rounded-full"></span>
            Now in Public Beta
          </div>

          <h1 className="from-foreground to-foreground/60 bg-linear-to-br bg-clip-text text-5xl leading-tight font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            Process and query your meeting transcripts with <span className="text-primary">AI</span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl">
            Upload your meeting transcripts. We automatically build a highly-accurate knowledge base, allowing you to ask
            questions and extract instant insights using our advanced RAG engine.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row lg:justify-start">
            <Link href="/register">
              <InteractiveHoverButton className="h-12 w-full px-8 text-lg font-medium sm:w-auto">Get Started</InteractiveHoverButton>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 w-full px-8 text-lg sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features List */}
        <div className="w-full max-w-lg flex-1 lg:max-w-xl">
          <div className="grid grid-cols-1 gap-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <MagicCard
                className="bg-background/40 hover:border-primary/50 border-white/10 backdrop-blur-sm transition-colors duration-300"
                gradientColor="rgba(255, 255, 255, 0.05)"
              >
                <div className="flex items-center space-x-4 p-5">
                  <div className="bg-primary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <FileText size={24} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">Instant Processing</h3>
                    <p className="text-muted-foreground text-sm">
                      Upload meeting transcripts. We automatically extract action items and summaries in seconds.
                    </p>
                  </div>
                </div>
              </MagicCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <MagicCard
                className="bg-background/40 hover:border-primary/50 border-white/10 backdrop-blur-sm transition-colors duration-300"
                gradientColor="rgba(255, 255, 255, 0.05)"
              >
                <div className="flex items-center space-x-4 p-5">
                  <div className="bg-primary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <MagnifyingGlass size={24} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">Semantic Search & RAG</h3>
                    <p className="text-muted-foreground text-sm">
                      Ask complex questions about your meetings and get accurate answers with direct citations.
                    </p>
                  </div>
                </div>
              </MagicCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <MagicCard
                className="bg-background/40 hover:border-primary/50 border-white/10 backdrop-blur-sm transition-colors duration-300"
                gradientColor="rgba(255, 255, 255, 0.05)"
              >
                <div className="flex items-center space-x-4 p-5">
                  <div className="bg-primary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <LockKey size={24} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">Enterprise Security</h3>
                    <p className="text-muted-foreground text-sm">
                      Your meeting data is encrypted. Granular access controls ensure only authorized access.
                    </p>
                  </div>
                </div>
              </MagicCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
