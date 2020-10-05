import React, { useState } from 'react';

export function useFormFields<T>(
  initialState: T
): [
  T,
  (event: React.ChangeEvent<HTMLInputElement>) => void,
  (newState: T) => void
] {
  const [fields, setValues] = useState<T>(initialState);

  return [
    fields,
    function (event: React.ChangeEvent<HTMLInputElement>) {
      setValues({
        ...fields,
        [event.target.id]: event.target.value,
      });
    },
    function (newState: T) {
      setValues(newState);
    },
  ];
}
