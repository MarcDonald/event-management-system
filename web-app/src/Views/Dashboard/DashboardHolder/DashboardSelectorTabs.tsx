import React, { useState } from 'react';

interface DashboardSelectorTabsPropTypes {}

export default function DashboardSelectorTabs(
  props: DashboardSelectorTabsPropTypes
) {
  return (
    <div className="flex flex-row justify-evenly mb-4">
      <button className="btn bg-darker-gray hover:bg-darkest-gray text-2xl font-bold">
        Incidents
      </button>
      <button className="btn text-2xl">Positions</button>
    </div>
  );
}
