import { ChartCoordinate, Coordinate, ChartOffset, LayoutType } from '../types';
import { RadialCursorPoints } from './getRadialCursorPoints';
export declare function getCursorPoints(layout: LayoutType, activeCoordinate: ChartCoordinate, offset: ChartOffset): [Coordinate, Coordinate] | RadialCursorPoints;
