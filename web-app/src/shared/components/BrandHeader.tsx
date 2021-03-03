import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const Header = styled.header`
  background-color: ${(props) => props.theme.brand};
  min-width: 100vw;
  width: 100vw;
  text-align: center;
  padding: 0.5rem 0;
`;

const HeaderTitle = styled.span`
  color: ${(props) => props.theme.onBrand};
  font-weight: bold;
  vertical-align: middle;
  font-size: 2.25rem;
  cursor: pointer;
`;

/**
 * Basic header displaying the brand name
 */
export default function BrandHeader() {
  const history = useHistory();

  return (
    <Header>
      <HeaderTitle onClick={() => history.push('/')}>
        Foobar Security
      </HeaderTitle>
    </Header>
  );
}
