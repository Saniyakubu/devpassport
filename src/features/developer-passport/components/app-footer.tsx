export function AppFooter() {
  return (
    <footer className="border-t border-slate-800/40 py-6 text-center text-xs text-slate-500">
      <p>
        © {new Date().getFullYear()} devpassport. Your GitHub identity,
        beautifully visualized.
      </p>
    </footer>
  );
}
