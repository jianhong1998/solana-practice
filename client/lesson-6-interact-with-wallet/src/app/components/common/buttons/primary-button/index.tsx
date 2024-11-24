import { FC, ReactNode } from 'react';
import classes from './primary-button.module.css';

type PrimaryButtonProps = {
  children: ReactNode;
  onClick: () => void;
};

const PrimaryButton: FC<PrimaryButtonProps> = ({ children, ...props }) => {
  return (
    <button className={classes['primary-button']} {...props}>
      {children}
    </button>
  );
};

export default PrimaryButton;
