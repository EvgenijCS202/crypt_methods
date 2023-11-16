export const generatorLoop = <T>(func: Generator<undefined, T>) => {
  let res: T | null = null;
  while (res === null) {
    const data = func.next();
    if (data.done) res = data.value;
  }
  return res as T;
};
