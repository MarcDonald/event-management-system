import React, { useState } from 'react';

/**
 * Tabs for selecting a type of dashboard to display
 */
export default function DashboardSelectorTabs() {
  return (
    <div className="flex flex-row justify-evenly mb-4">
      <button className="btn bg-darker-gray hover:bg-darkest-gray text-2xl font-bold">
        Incidents
      </button>
      <button className="btn text-2xl">Positions</button>
    </div>
  );
}
