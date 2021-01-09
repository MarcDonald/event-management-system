import React from 'react';

interface ManagementEditHeaderPropTypes {
  title: string;
  delete: () => any;
  save: () => any;
  disableButtons: boolean;
}

/**
 * Header with a save and delete button and a title that can change on the fly.
 * For use with editable management pages
 */
export default function ManagementEditHeader(
  props: ManagementEditHeaderPropTypes
) {
  return (
    <div className="flex flex-row justify-between bg-white mt-8 p-4 rounded-md">
      <button
        className="btn btn-negative px-8"
        disabled={props.disableButtons}
        onClick={props.delete}
      >
        Delete
      </button>
      <h1 className="text-4xl font-bold">{props.title}</h1>
      <button
        className="btn px-8"
        disabled={props.disableButtons}
        onClick={props.save}
      >
        Save
      </button>
    </div>
  );
}
