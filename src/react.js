/**
 * 创建虚拟节点
 * @param {*} type 节点类型
 * @param {*} config 节点配置
 * @param {*} children 节点孩子
 * @returns
 */
function createElement(type, config, children) {
  // 将属性统一放到props上
  let props = { ...config }
  if (arguments.length > 3) {
    // 参数个数大于3时，第三个往后都是后代，并放到数组中
    props.children = Array.prototype.slice.call(arguments, 2)
  } else {
    // 否则直接放到children属性上
    props.children = children
  }
  return {
    type,
    props,
  }
}
const React = {
  createElement,
}
export default React
