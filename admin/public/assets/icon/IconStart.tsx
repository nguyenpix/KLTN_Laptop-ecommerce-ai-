import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

interface IIcon {
  onClick?: () => void;
  color?: string;
  width?: number;
  height?: number;
  check?: boolean;
}
const IconStar: FunctionComponent<IIcon> = ({ onClick, width, height, check = true }) => {
  return (
    <span onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width={width || 12} height={height || 12} fill="none" viewBox="0 0 13 12">
        <path
          fill={check ? '#E9A426' : '#A2A6B0'}
          d="M6.755.174a.1.1 0 01.178 0l1.84 3.594a.1.1 0 00.073.053l3.987.64a.1.1 0 01.055.169l-2.85 2.86a.1.1 0 00-.027.086l.623 3.99a.1.1 0 01-.144.104L6.89 9.844a.1.1 0 00-.09 0L3.197 11.67a.1.1 0 01-.144-.104l.624-3.99a.1.1 0 00-.028-.086L.799 4.63a.1.1 0 01.056-.17l3.986-.64a.1.1 0 00.074-.052L6.755.174z"
        ></path>
      </svg>
    </span>
  );
};

export default IconStar;