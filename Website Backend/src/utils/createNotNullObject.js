export function createNotNullObject(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] != null) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

export default createNotNullObject;
