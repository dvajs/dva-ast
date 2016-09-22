
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
