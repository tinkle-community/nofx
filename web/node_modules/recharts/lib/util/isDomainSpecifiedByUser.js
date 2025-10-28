"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isDomainSpecifiedByUser = isDomainSpecifiedByUser;
var _DataUtils = require("./DataUtils");
/**
 * Takes a domain and user props to determine whether he provided the domain via props or if we need to calculate it.
 * @param   {AxisDomain}  domain              The potential domain from props
 * @param   {Boolean}     allowDataOverflow   from props
 * @param   {String}      axisType            from props
 * @returns {Boolean}                         `true` if domain is specified by user
 */
function isDomainSpecifiedByUser(domain, allowDataOverflow, axisType) {
  if (axisType === 'number' && allowDataOverflow === true && Array.isArray(domain)) {
    var domainStart = domain === null || domain === void 0 ? void 0 : domain[0];
    var domainEnd = domain === null || domain === void 0 ? void 0 : domain[1];

    /*
     * The `isNumber` check is needed because the user could also provide strings like "dataMin" via the domain props.
     * In such case, we have to compute the domain from the data.
     */
    if (!!domainStart && !!domainEnd && (0, _DataUtils.isNumber)(domainStart) && (0, _DataUtils.isNumber)(domainEnd)) {
      return true;
    }
  }
  return false;
}