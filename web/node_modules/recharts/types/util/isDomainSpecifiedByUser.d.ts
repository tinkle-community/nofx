import { AxisDomain, BaseAxisProps } from './types';
/**
 * Takes a domain and user props to determine whether he provided the domain via props or if we need to calculate it.
 * @param   {AxisDomain}  domain              The potential domain from props
 * @param   {Boolean}     allowDataOverflow   from props
 * @param   {String}      axisType            from props
 * @returns {Boolean}                         `true` if domain is specified by user
 */
export declare function isDomainSpecifiedByUser(domain: AxisDomain, allowDataOverflow: boolean, axisType: BaseAxisProps['type']): boolean;
