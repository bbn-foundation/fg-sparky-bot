export function filterUniqueObjects<T extends object, K extends keyof T>(array: T[], prop: K): T[] {
  const uniqueProps: T[K][] = [];
  const uniqueArray = array.filter(item => {
    if (uniqueProps.includes(item[prop])) return false;
    else {
      uniqueProps.push(item[prop]);
      return true;
    }
  });
  return uniqueArray;
}
