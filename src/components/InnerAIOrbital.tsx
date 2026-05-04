export const InnerAIOrbital = () => {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: "1672 / 941" }}
      aria-label="Inner AI Animated Interface"
    >
      <iframe
        src="/inner-ai-interface.html"
        title="Inner AI Animated Interface"
        loading="lazy"
        className="absolute inset-0 w-full h-full border-0 pointer-events-none select-none"
        scrolling="no"
      />
    </div>
  );
};

export default InnerAIOrbital;