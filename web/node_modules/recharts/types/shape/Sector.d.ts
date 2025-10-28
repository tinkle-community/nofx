/**
 * @fileOverview Sector
 */
import React, { SVGProps } from 'react';
import { GeometrySector } from '../util/types';
interface SectorProps extends GeometrySector {
    className?: string;
}
export type Props = SVGProps<SVGPathElement> & SectorProps;
export declare const Sector: React.FC<Props>;
export {};
