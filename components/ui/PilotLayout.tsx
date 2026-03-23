"use client";

import React from "react";

interface PilotLayoutProps {
  children: React.ReactNode;
}

const PilotLayout: React.FC<PilotLayoutProps> = ({children}) => {
  console.log(children);
  return (
      <div className="p-5">
        {children}
      </div>
  );
};

export default PilotLayout;
