import { EvaluatingStatus } from "./abortingEval";

export function* MatrixGenRecursive(
  dim: number,
  matrix: number[][] | null
): Generator<EvaluatingStatus, number[][][]> {
  if (matrix === null) {
    const zeros = MatrixGenRecursive(dim, [[0]]);
    let zerosRes: number[][][] | null = null;
    while (zerosRes === null) {
      const data = zeros.next();
      if (data.done) zerosRes = data.value;
    }
    const ones = MatrixGenRecursive(dim, [[1]]);
    let onesRes: number[][][] | null = null;
    while (onesRes === null) {
      const data = ones.next();
      if (data.done) onesRes = data.value;
    }
    yield {
      type: "genAffineMatrixes",
      value: `${zerosRes.length + onesRes.length}`,
    };
    return [...zerosRes, ...onesRes];
  }
  const row = matrix.length - 1;
  if (matrix[row].length === dim) {
    if (!checkRows(matrix)) return [];
    if (matrix.length === dim) {
      if (checkDet(matrix) % 2 !== 0) return [matrix];
      return [];
    }

    const zeros = MatrixGenRecursive(dim, [...copyMatrix(matrix), [0]]);
    let zerosRes: number[][][] | null = null;
    while (zerosRes === null) {
      const data = zeros.next();
      if (data.done) zerosRes = data.value;
    }
    const ones = MatrixGenRecursive(dim, [...copyMatrix(matrix), [1]]);
    let onesRes: number[][][] | null = null;
    while (onesRes === null) {
      const data = ones.next();
      if (data.done) onesRes = data.value;
    }
    yield {
      type: "genAffineMatrixes",
      value: `${zerosRes.length + onesRes.length}`,
    };
    return [...zerosRes, ...onesRes];
  }
  const newZero = copyMatrix(matrix);
  newZero[row].push(0);
  const newOne = copyMatrix(matrix);
  newOne[row].push(1);

  const zeros = MatrixGenRecursive(dim, newZero);
  let zerosRes: number[][][] | null = null;
  while (zerosRes === null) {
    const data = zeros.next();
    if (data.done) zerosRes = data.value;
  }
  const ones = MatrixGenRecursive(dim, newOne);
  let onesRes: number[][][] | null = null;
  while (onesRes === null) {
    const data = ones.next();
    if (data.done) onesRes = data.value;
  }
  yield {
    type: "genAffineMatrixes",
    value: `${zerosRes.length + onesRes.length}`,
  };
  return [...zerosRes, ...onesRes];
}

const copyMatrix = (matrix: number[][]) => {
  return [...matrix.map((row) => [...row])];
};

const checkDet = (matrix: number[][]): number => {
  if (matrix.length === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }
  return matrix[0].reduce(
    (prev, cur, ind) =>
      prev +
      (-1) ** ind *
        cur *
        checkDet(
          matrix.slice(1).map((row) => [...row.filter((_, j) => ind !== j)])
        ),
    0
  );
};

const checkRows = (matrix: number[][]) => {
  for (let i = 0; i < matrix.length; ++i) {
    const row1 = matrix[i]
      .map((val, index) => val << index)
      .reduce((prev, cur) => prev | cur);
    if (row1 === 0) return false;
  }
  return true;
};
