import { EvaluatingStatus } from "./abortingEval";
import { MatrixGenRecursive } from "./generateMatrixes";

export function* getAffineFuncs(
  dim: number
): Generator<EvaluatingStatus, Set<string>, unknown> {
  const generatedGen = MatrixGenRecursive(dim, null);
  let generated: number[][][] | null = null;
  while (generated === null) {
    const data = generatedGen.next();
    if (data.done) generated = data.value;
    else yield data.value;
  }
  let affineFunctions: Set<string> = new Set();
  for (const matrix of generated) {
    const vec = Array(2 ** dim)
      .fill(null)
      .map((_, ind) => {
        let res = 0;
        for (let j = 0; j < dim; ++j)
          for (let i = 0; i < dim; ++i) {
            res ^= (matrix[i][j] & (ind >>> (dim - 1 - i))) << (dim - 1 - j);
          }
        return res;
      });
    affineFunctions.add(
      vec.map((val) => `${val ^ vec[0]}`).reduce((pr, cur) => pr + " " + cur)
    );
    yield { type: "genAffineFuncs", value: `${affineFunctions.size}` };
  }
  return affineFunctions;
}

export const multiplyFuncs = (func1: number[], func2: number[]) => {
  if (func1.length !== func2.length) {
    console.error(
      "Can't multiply functions with different dimensions!\n",
      func1,
      func2
    );
    return func1.length > func2.length
      ? func1.map(() => 0)
      : func2.map(() => 0);
  }
  return func1.map((val) => func2[val]);
};
