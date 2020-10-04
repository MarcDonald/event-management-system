import React from 'react';
import { useHistory } from 'react-router-dom';

export default function BrandHeader() {
  const history = useHistory();

  return (
    <header className="bg-brand min-w-screen text-center py-2">
      <span
        className="text-white font-bold align-middle text-4xl cursor-pointer"
        onClick={() => history.push('/')}
      >
        Foobar Security
      </span>
    </header>
  );
}
