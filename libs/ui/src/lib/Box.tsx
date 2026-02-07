import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export interface BoxProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
  as?: ElementType;
}

export function Box({
  children,
  className,
  as: Component = 'div',
  ...rest
}: BoxProps) {
  return (
    <Component className={className} {...rest}>
      {children}
    </Component>
  );
}
