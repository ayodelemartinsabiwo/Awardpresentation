interface AlignmentGuidesProps {
  guides: { x?: number; y?: number }[];
  containerWidth: number;
  containerHeight: number;
}

export function AlignmentGuides({ guides, containerWidth, containerHeight }: AlignmentGuidesProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {guides.map((guide, index) => (
        <div key={index}>
          {/* Vertical guide */}
          {guide.x !== undefined && (
            <div
              className="absolute top-0 bottom-0 w-px bg-blue-400/70"
              style={{
                left: guide.x,
                boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)',
              }}
            />
          )}
          {/* Horizontal guide */}
          {guide.y !== undefined && (
            <div
              className="absolute left-0 right-0 h-px bg-blue-400/70"
              style={{
                top: guide.y,
                boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
