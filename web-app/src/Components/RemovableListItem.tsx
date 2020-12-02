import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface RemovableListItemPropTypes {
  listKey: string;
  content: React.ReactNode;
  deleteAction: (key: string) => any;
}

/**
 * Readonly display of data with a delete button
 */
export default function RemovableListItem(props: RemovableListItemPropTypes) {
  return (
    <div
      key={props.listKey}
      className="w-full bg-white p-2 mb-2 flex justify-between items-center rounded-md"
    >
      <div className="text-2xl">{props.content}</div>
      <button
        type="button"
        onClick={() => {
          props.deleteAction(props.listKey);
        }}
        className="text-center focus:outline-none bg-negative hover:bg-negative-light focus:bg-negative-light rounded-md p-1 text-white w-10 h-10"
      >
        <FontAwesomeIcon icon={faTrash} className={`text-2xl align-middle`} />
      </button>
    </div>
  );
}
