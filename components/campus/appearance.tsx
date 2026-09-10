'use client';

import {useEffect,useState,type ReactNode} from 'react';
import {ThemeProvider,useTheme} from 'next-themes';
import {Moon,Sun} from 'lucide-react';

export function AppearanceProvider({children}:{children:ReactNode}) {
  return <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="campusfix-theme">{children}</ThemeProvider>;
}

export function ThemeToggle() {
  const {resolvedTheme,setTheme}=useTheme();
  const [mounted,setMounted]=useState(false);
  useEffect(()=>setMounted(true),[]);
  const dark=mounted&&resolvedTheme==='dark';
  const label=mounted?`Switch to ${dark?'light':'dark'} mode`:'Toggle color theme';
  return <button type="button" className="icon-button theme-toggle" aria-label={label} title={label} aria-pressed={dark} onClick={()=>setTheme(document.documentElement.classList.contains('dark')?'light':'dark')}>
    <Moon size={18} className="theme-moon" aria-hidden="true"/>
    <Sun size={18} className="theme-sun" aria-hidden="true"/>
  </button>;
}
