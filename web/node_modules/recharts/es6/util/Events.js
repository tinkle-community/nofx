import EventEmitter from 'eventemitter3';
var eventCenter = new EventEmitter();
export { eventCenter };
export var SYNC_EVENT = 'recharts.syncMouseEvents';