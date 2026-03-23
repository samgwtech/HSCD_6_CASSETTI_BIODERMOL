"use client";

import React from "react";

interface HoverOverlayProps {
  content: string;
  visible: boolean;
}

const HoverOverlay: React.FC<HoverOverlayProps> = ({ content, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 right-40 z-50 p-4 bg-gray-800 text-white rounded shadow-lg">
      {content}
    </div>
  );
};

export default HoverOverlay;
