const fs = require('fs');
let c = fs.readFileSync('src/components/AuthProvider.tsx', 'utf-8');

c = c.replace(
  "import { useState, useEffect } from 'react';",
  "import { useState, useEffect } from 'react';\nimport { useSettingsStore } from '@/src/store/settings';"
);

c = c.replace(
  "const { isAuthenticated, login } = useAuthStore();",
  "const { isAuthenticated, login } = useAuthStore();\n  const { workshopName, workshopLogo } = useSettingsStore();"
);

c = c.replace(
  `<div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-zinc-950 font-bold tracking-tighter mb-4 shadow-sm">
              GW
            </div>
            <h1 className="text-xl font-medium text-zinc-100">Guitar Workshop</h1>
            <p className="text-sm text-zinc-500 mt-1">Sign in to access POS & Queue</p>
          </div>`,
  `<div className="flex flex-col items-center mb-8">
            {workshopLogo ? (
              <img src={workshopLogo} alt={workshopName} className="w-16 h-16 rounded-xl object-cover mb-4 shadow-sm border border-zinc-800/50" />
            ) : (
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-zinc-950 text-xl font-bold tracking-tighter mb-4 shadow-sm">
                {(workshopName || 'GW').substring(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-medium text-zinc-100">{workshopName || 'Guitar Workshop'}</h1>
            <p className="text-sm text-zinc-500 mt-1">Sign in to access POS & Queue</p>
          </div>`
);

fs.writeFileSync('src/components/AuthProvider.tsx', c);
