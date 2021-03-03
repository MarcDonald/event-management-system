import React from 'react';
import BrandHeader from '../../shared/components/BrandHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const Content = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-top: 5rem;
`;

const HomeIcon = styled(FontAwesomeIcon)`
  font-size: 3rem;
  color: ${(props) => props.theme.brand};
  margin-top: 2rem;
  cursor: pointer;
`;

/**
 * 404 Page
 */
export default function NotFound() {
  const history = useHistory();

  return (
    <>
      <BrandHeader />
      <Content>
        <Title>404 - Not Found</Title>
        <HomeIcon icon={faHome} onClick={() => history.push('/')} />
      </Content>
    </>
  );
}
