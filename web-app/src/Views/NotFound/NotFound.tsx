import React from 'react';
import BrandHeader from '../../Components/BrandHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';

/**
 * 404 Page
 */
function NotFound() {
  const history = useHistory();

  return (
    <>
      <BrandHeader />
      <div className="text-center">
        <h1 className="text-5xl mt-20">404 - Not Found</h1>
        <FontAwesomeIcon
          icon={faHome}
          className="text-5xl text-brand mt-8 cursor-pointer"
          onClick={() => history.push('/')}
        />
      </div>
    </>
  );
}

export default NotFound;
