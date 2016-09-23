
/**
 * uniq Object 格式的 dispatch 列表
 *
 * e.g.
 * uniqDispatches([{type:'add'},{type:'add'}]) // output [{type:'add'}]
 */
export function uniqDispatches(dispatches) {
  const types = {};
  return dispatches.filter(dispatch => {
    const { type } = dispatch;
    if (!types[type]) {
      types[type] = true;
      return true;
    }
  });
}
