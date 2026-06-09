import React from 'react';
import { CinematicBg } from './cinematic-bg';
import { motion } from 'framer-motion';

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: string }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      <CinematicBg />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center"
      >
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, letterSpacing: "0px" }}
            animate={{ opacity: 1, letterSpacing: "4px" }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-4xl md:text-5xl font-black text-primary glow-text uppercase tracking-widest"
          >
            Varecvsce
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-4 text-muted-foreground tracking-widest uppercase text-sm"
          >
            {title}
          </motion.p>
          {subtitle && (
            <p className="mt-2 text-xs text-muted-foreground/60 max-w-[280px] mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="w-full bg-card/40 backdrop-blur-xl border border-primary/20 rounded-lg p-8 glow-box">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
