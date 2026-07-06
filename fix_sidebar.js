const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

if (!content.includes('logout()')) {
  content = content.replace(
    "const { user } = useAuthStore();",
    "const { user, logout } = useAuthStore();"
  );
  
  content = content.replace(
    "<Link href=\"/settings\" className=\"flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900/50 transition-colors cursor-pointer\">",
    "<div className=\"flex flex-col gap-2\">\n          <Link href=\"/settings\" className=\"flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900/50 transition-colors cursor-pointer\">"
  );

  content = content.replace(
    "          </Link>\n      </div>",
    "          </Link>\n          <button onClick={() => logout()} className=\"flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900/50 transition-colors cursor-pointer text-zinc-400 hover:text-rose-400 w-full text-left\">\n            <LogOut className=\"w-4 h-4 ml-2\" />\n            <span className=\"text-xs font-medium\">Log Out</span>\n          </button>\n        </div>\n      </div>"
  );
}

fs.writeFileSync('src/components/Sidebar.tsx', content);
