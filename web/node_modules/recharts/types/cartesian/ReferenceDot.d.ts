/**
 * @fileOverview Reference Dot
 */
import React, { ReactElement } from 'react';
import { Props as DotProps } from '../shape/Dot';
import { ImplicitLabelType } from '../component/Label';
import { IfOverflow } from '../util/IfOverflowMatches';
import { D3Scale } from '../util/types';
import { Props as XAxisProps } from './XAxis';
import { Props as YAxisProps } from './YAxis';
interface InternalReferenceDotProps {
    xAxis?: Omit<XAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
    };
    yAxis?: Omit<YAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
    };
    clipPathId?: number | string;
}
interface ReferenceDotProps extends InternalReferenceDotProps {
    r?: number;
    isFront?: boolean;
    /** @deprecated use ifOverflow="extendDomain"  */
    alwaysShow?: boolean;
    ifOverflow?: IfOverflow;
    x?: number | string;
    y?: number | string;
    className?: number | string;
    yAxisId?: number | string;
    xAxisId?: number | string;
    shape?: ReactElement<SVGElement> | ((props: any) => ReactElement<SVGElement>);
    label?: ImplicitLabelType;
}
export type Props = DotProps & ReferenceDotProps;
export declare class ReferenceDot extends React.Component<Props> {
    static displayName: string;
    static defaultProps: {
        isFront: boolean;
        ifOverflow: string;
        xAxisId: number;
        yAxisId: number;
        r: number;
        fill: string;
        stroke: string;
        fillOpacity: number;
        strokeWidth: number;
    };
    static renderDot: (option: Props['shape'], props: any) => React.JSX.Element;
    render(): React.JSX.Element;
}
export {};
