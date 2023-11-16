import { wait } from "@testing-library/user-event/dist/utils";
import { useRef, useState } from "react";

export type EvaluatingStatus =
  | {
      type: "notEvaluating";
    }
  | {
      type: "genAffineFuncs";
      value: string;
    }
  | {
      type: "checkingAffineEq";
      value: string;
    }
  | {
      type: "genAffineMatrixes";
      value: string;
    };

export const useAbortingEval = (time: number = 1000) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const abort = useRef(false);
  const [status, setStatus] = useState<EvaluatingStatus>({
    type: "notEvaluating",
  });
  const [timeDiff, setTimeDiff] = useState({ diff: 0, time: 0 });

  return {
    start: <T,>(func: Generator<EvaluatingStatus, T, unknown>) =>
      new Promise<T>(async (res, rej) => {
        let lastTime = new Date().valueOf();
        let lastStatus: EvaluatingStatus = { type: "notEvaluating" };
        setIsEvaluating(true);
        await wait(100);
        let diff = 0;
        while (!abort.current) {
          const data = func.next();
          diff++;
          if (data.done) {
            res(data.value);
            setIsEvaluating(false);
            setStatus({ type: "notEvaluating" });
            return;
          }
          const now = new Date().valueOf();
          if (now - lastTime > time) {
            if (lastStatus.type === data.value.type)
              setTimeDiff({ diff, time: now - lastTime });
            else setTimeDiff({ diff: 0, time: 0 });
            setStatus(data.value);
            lastStatus = data.value;
            await wait(100);
            lastTime = now;
            diff = 0;
          }
        }
        abort.current = false;
        func.return(null as T);
        rej(new Error("aborted"));
        setIsEvaluating(false);
        setStatus({ type: "notEvaluating" });
        return;
      }),
    abort: () => {
      abort.current = true;
    },
    isEvaluating,
    status,
    timeDiff,
  };
};
