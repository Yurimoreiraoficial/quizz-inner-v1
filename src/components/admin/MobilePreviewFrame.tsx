export function MobilePreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-mobile-frame">
      <div className="admin-mobile-screen">{children}</div>
    </div>
  );
}