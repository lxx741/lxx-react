import { REACT_TEXT } from './constant'
// 未定义的值，即值为null或undefined
export function isUndefined(v) {
  return v === undefined || v === null
}
// 定义的值，即值不为null且undefined
export function isDefined(v) {
  return v !== undefined && v !== null
}
// 将单个值转化为数组，多维数组拍平
export function wrapToArray(value) {
  return Array.isArray(value) ? value.flat() : [value]
}
// 将字符串或数字类型的值转化成对象格式
export function wrapToVdom(element) {
  return typeof element === 'string' || typeof element === 'number'
    ? { type: REACT_TEXT, props: element }
    : element
}
