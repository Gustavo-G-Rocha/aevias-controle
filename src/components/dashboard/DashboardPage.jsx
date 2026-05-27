/**
 * Container layout para Dashboard
 */
import React from 'react';

export default function DashboardPage({ children }) {
  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}