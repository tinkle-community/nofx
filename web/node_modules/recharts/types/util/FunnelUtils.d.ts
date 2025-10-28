import React, { SVGProps } from 'react';
import { FunnelProps, FunnelTrapezoidItem } from '../numberAxis/Funnel';
import { Props as TrapezoidProps } from '../shape/Trapezoid';
export declare function typeGuardTrapezoidProps(option: SVGProps<SVGPathElement>, props: FunnelTrapezoidItem): TrapezoidProps;
type FunnelTrapezoidProps = {
    option: FunnelProps['activeShape'];
} & FunnelTrapezoidItem;
export declare function FunnelTrapezoid(props: FunnelTrapezoidProps): React.JSX.Element;
export {};
