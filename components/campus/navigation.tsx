'use client';
import {useSyncExternalStore,forwardRef} from 'react';

import {useSidebar} from '@/components/ui/sidebar';
const event='campusfix:navigate';
function subscribe(callback:()=>void){window.addEventListener(event,callback);window.addEventListener('popstate',callback);return ()=>{window.removeEventListener(event,callback);window.removeEventListener('popstate',callback);};}
export function navigate(href:string){if(window.location.pathname!==href){window.history.pushState(null,'',href);window.dispatchEvent(new Event(event));window.scrollTo({top:0,behavior:'instant'});}}
export function usePathname(){const initial="/";return useSyncExternalStore(subscribe,()=>window.location.pathname,()=>initial);}
export function useRouter(){return {push:navigate};}
export const Link=forwardRef<HTMLAnchorElement,React.ComponentPropsWithoutRef<'a'> & {href:string}>(function Link({href,onClick,children,...props},ref){const {setOpenMobile}=useSidebar();return <a {...props} href={href} ref={ref} onClick={e=>{onClick?.(e);if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||props.target||props.download||!href.startsWith('/'))return;e.preventDefault();setOpenMobile(false);navigate(href);}}>{children}</a>;});
