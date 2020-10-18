import React from 'react';
import AsyncButton from '../../Components/AsyncButton';

interface ManagementEditHeaderPropTypes {
  delete: () => any;
  title: string;
  save: () => any;
  isDeleting: boolean;
  isSaving: boolean;
}

export default function ManagementEditHeader(
  props: ManagementEditHeaderPropTypes
) {
  return (
    <div className="flex flex-row justify-between bg-white mt-8 p-4 rounded-md">
      <AsyncButton
        enabledClassName="btn btn-negative px-8"
        text="Delete"
        isLoading={props.isDeleting}
        onClick={props.delete}
      />
      <h1 className="text-4xl font-bold">{props.title}</h1>
      <AsyncButton
        enabledClassName="btn px-8"
        text="Save"
        isLoading={props.isSaving}
        onClick={props.save}
      />
    </div>
  );
}
