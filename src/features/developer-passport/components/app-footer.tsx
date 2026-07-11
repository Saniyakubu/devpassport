export function AppFooter() {
  return (
    <footer className="space-y-2 border-t border-slate-800/40 pt-10 text-center text-xs text-slate-500">
      <p>© {new Date().getFullYear()} GitID. Your GitHub identity, beautifully visualized.</p>
      <p className="font-mono opacity-70">GITID v2.0</p>
    </footer>
  );
}
