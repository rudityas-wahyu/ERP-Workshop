'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Package, ShoppingCart, FileText, Users, DollarSign, LogOut } from 'lucide-react';
import { useAuthStore } from '@/src/store/auth';
import { useSettingsStore } from '@/src/store/settings';
import { useState } from 'react';
import Image from 'next/image';

const navigation = [
  { name: 'Workshop Queue', href: '/', icon: Settings },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Point of Sale', href: '/sales', icon: ShoppingCart },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
];
const reports = [
  { name: 'Finance Dashboard', href: '/finance', icon: DollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { workshopName, logoUrl } = useSettingsStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  
  return (
    <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950 flex flex-col shrink-0 relative">
      <div className="h-16 border-b border-zinc-800/50 flex items-center px-6 gap-3 shrink-0">
        {logoUrl ? (
          <div className="w-7 h-7 relative rounded overflow-hidden">
             <Image src={logoUrl} alt="Logo" fill className="object-cover" referrerPolicy="no-referrer" />
          </div>
        ) : (
          <div className="w-7 h-7 bg-white rounded flex items-center justify-center text-zinc-950 font-bold text-xs tracking-tighter">
            GW
          </div>
        )}
        <span className="font-semibold tracking-tight text-zinc-100 text-sm truncate">{workshopName || 'Guitar Workshop'}</span>
      </div>
      
      <nav className="flex-1 py-6 overflow-y-auto px-4 space-y-8">
        <div>
          <div className="px-2 text-[10px] font-mono tracking-widest text-zinc-500 mb-3">MANAGEMENT</div>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive 
                      ? 'bg-zinc-800/50 text-white font-medium shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                  }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 shrink-0 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div>
          <div className="px-2 text-[10px] font-mono tracking-widest text-zinc-500 mb-3">REPORTS</div>
          <div className="space-y-1">
            {reports.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive 
                      ? 'bg-zinc-800/50 text-white font-medium shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                  }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 shrink-0 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <div className="p-4 border-t border-zinc-800/50 shrink-0 relative">
        {showUserMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-zinc-900 border border-zinc-700/50 rounded-lg p-1 shadow-xl z-50">
            <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors">
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
            <button onClick={() => { setShowUserMenu(false); logout(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors text-left">
              <LogOut className="w-3.5 h-3.5" />
              Log Out
            </button>
          </div>
        )}
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)} 
          className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer text-left ${showUserMenu ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/50'}`}
        >
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 text-xs font-semibold tracking-tight border border-zinc-700/50 shrink-0">
            {initials}
          </div>
          <div className="text-xs truncate flex-1">
            <p className="text-zinc-100 font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-zinc-500 truncate">{user?.role || 'Role'}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
