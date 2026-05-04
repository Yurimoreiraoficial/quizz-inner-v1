export const InnerAIOrbital = () => {
  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: "1672 / 941", background: "transparent" }}
      aria-label="Inner AI Animated Interface"
    >
      <iframe
        src="/inner-ai-interface.html"
        title="Inner AI Animated Interface"
        loading="eager"
        className="absolute inset-0 w-full h-full border-0 pointer-events-none select-none"
        scrolling="no"
        style={{ background: "transparent" }}
        allowTransparency
      />
    </div>
  );
};

export default InnerAIOrbital;