export function AdminLogo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center text-white font-bold text-sm"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "var(--admin-dark)",
          letterSpacing: "-0.02em",
        }}
      >
        IA
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--admin-text)" }}>
          Inner AI
        </div>
        <div
          className="text-[10px] font-semibold uppercase"
          style={{ color: "var(--admin-muted)", letterSpacing: "0.14em" }}
        >
          Funil Builder
        </div>
      </div>
    </div>
  );
}