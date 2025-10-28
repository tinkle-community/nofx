import { ReactNode, ReactElement } from 'react';
import { Props as LegendProps } from '../component/Legend';
import { FormattedGraphicalItem } from './ChartUtils';
export declare const getLegendProps: ({ children, formattedGraphicalItems, legendWidth, legendContent, }: {
    children: ReactNode[];
    formattedGraphicalItems?: Array<FormattedGraphicalItem>;
    legendWidth: number;
    legendContent?: 'children';
}) => null | (LegendProps & {
    item: ReactElement;
});
