import { EvaluatingStatus } from "./abortingEval";
import { getAffineFuncs, multiplyFuncs } from "./affineFuncs";

export function* checkAffineEq(
  boolFunctions: number[][],
  dim: number
): Generator<EvaluatingStatus, ({ A: string; B: string } | null)[][], unknown> {
  const iter1 = getAffineFuncs(dim);
  let affineFuncs: Set<string> = new Set();
  let done: boolean | undefined = false;
  while (!done) {
    const data = iter1.next();
    if (data.done) affineFuncs = data.value;
    else yield data.value;
    done = data.done;
  }

  const answers: ({ A: string; B: string } | null)[][] = Array(
    boolFunctions.length - 1
  )
    .fill(null)
    .map((_, ind) =>
      Array(boolFunctions.length - 1 - ind)
        .fill(null)
        .map(() => null)
    );

  let currentFound = 0;
  const maxFound = (boolFunctions.length * (boolFunctions.length - 1)) / 2;
  let i = -1;
  for (const affineFunc of affineFuncs) {
    ++i;
    let c = 0;
    for (let p1 = 0; p1 < boolFunctions.length - 1; ++p1) {
      if (
        answers[p1].map((val) => val !== null).reduce((pr, cur) => pr && cur)
      ) {
        c += answers[p1].length;
        yield {
          type: "checkingAffineEq",
          value: `${
            (i * boolFunctions.length * (boolFunctions.length - 1)) / 2 + c
          }`,
        };
        continue;
      }
      const revFunc = boolFunctions[p1]
        .map((val, ind) => ({ val: ind, ind: val }))
        .sort((a, b) => a.ind - b.ind)
        .map((val) => val.val);
      for (let p2 = p1 + 1; p2 < boolFunctions.length; ++p2) {
        if (answers[p1][p2 - p1 - 1] !== null) {
          c++;
          yield {
            type: "checkingAffineEq",
            value: `${
              (i * boolFunctions.length * (boolFunctions.length - 1)) / 2 + c
            }`,
          };
          continue;
        }
        const A = affineFunc.split(" ").map((val) => +val);
        const B = multiplyFuncs(multiplyFuncs(revFunc, A), boolFunctions[p2])
          .map((val) => `${val}`)
          .reduce((prev, cur) => prev + " " + cur);
        if (affineFuncs.has(B)) {
          answers[p1][p2 - p1 - 1] = { A: affineFunc, B };
          currentFound++;
          if (currentFound === maxFound) return answers;
        }
        yield {
          type: "checkingAffineEq",
          value: `${
            (i * boolFunctions.length * (boolFunctions.length - 1)) / 2 + c
          }`,
        };
      }
    }
  }
  return answers;
}
