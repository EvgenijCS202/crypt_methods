import { Form, Row, Col, Typography, InputNumber, Input, Button } from "antd";
import { useForm } from "antd/es/form/Form";
import { Fragment, useEffect, useState } from "react";
import { checkAffineEq } from "../../util/checkAffineEq";
import { EvaluatingStatus, useAbortingEval } from "../../util/abortingEval";
import { LoadingOutlined } from "@ant-design/icons";

interface IAffineFormProps {
  index: number;
  deleteButton?: JSX.Element;
}
const AffineForm = ({ index, deleteButton }: IAffineFormProps) => {
  const [form] = useForm();
  const [dims, setDims] = useState(3);
  const [answer, setAnswer] = useState<
    ({
      A: string;
      B: string;
    } | null)[][]
  >();
  const { isEvaluating, status, timeDiff, ...abortingEval } =
    useAbortingEval(2000);

  const [maxConst, setMaxConst] = useState({
    matrixes: 0,
    affineFuncs: 0,
    affineFind: 0,
  });

  useEffect(() => {
    form.setFieldValue(
      "functions",
      Array(form.getFieldValue("functions").length)
        .fill(null)
        .map(() =>
          Array(2 ** dims)
            .fill(0)
            .map((_, index) => `${index}`)
            .reduce((prev, next) => prev + " " + next)
        )
    );
    setAnswer(undefined);
  }, [form, dims]);

  const onFormFinished = (values: { dims: number; functions: string[] }) => {
    setAnswer(undefined);
    const boolFunctions = values.functions.map((func) =>
      func.split(" ").map((num) => +num)
    );
    const n = values.dims;
    const maxMatrixes =
      2 ** ((n * (n - 1)) / 2) *
      Array(n - 1)
        .fill(null)
        .map((_, ind1) =>
          Array(ind1 + 2)
            .fill(1)
            .map((val, ind2) => val << ind2)
            .reduce((pr, cur) => pr | cur)
        )
        .reduce((pr, cur) => pr * cur);
    setMaxConst({
      matrixes: maxMatrixes,
      affineFuncs: maxMatrixes,
      affineFind:
        (maxMatrixes * boolFunctions.length * (boolFunctions.length - 1)) / 2,
    });
    abortingEval
      .start(checkAffineEq(boolFunctions, values.dims))
      .then((ans) => setAnswer(ans))
      .catch((e) => console.log(e));
  };

  return (
    <Form form={form} onFinish={onFormFinished}>
      <Row>
        <Col span={24}>
          <Typography.Title level={5}>
            Аффинная эквивалентность {index + 1}
          </Typography.Title>
        </Col>
        <Col span={24}>
          <Form.Item
            name="dims"
            initialValue={dims}
            label="Размерность пространства"
          >
            <InputNumber
              min={3}
              max={4}
              value={dims}
              onChange={(value) => setDims(value || 3)}
              disabled={isEvaluating}
            />
          </Form.Item>
        </Col>
        <Form.List
          name="functions"
          initialValue={Array(2)
            .fill(null)
            .map(() =>
              Array(2 ** dims)
                .fill(0)
                .map((_, index) => `${index}`)
                .reduce((prev, next) => prev + " " + next)
            )}
        >
          {(functions, { add, remove }) => (
            <>
              {functions.map((func, ind) => (
                <Fragment key={func.key}>
                  <Col span={24}>
                    <Typography.Text>
                      Введите {ind + 1} вектор выходных значений для входных:
                    </Typography.Text>
                  </Col>
                  <Col span={22} style={{ paddingInline: 12 }}>
                    <Typography.Text>
                      {Array(2 ** dims)
                        .fill(0)
                        .map((_, index) => `${index}`)
                        .reduce((prev, next) => prev + " " + next)}
                    </Typography.Text>
                  </Col>
                  <Col span={2} />
                  <Col span={22}>
                    <Form.Item
                      name={func.name}
                      initialValue={Array(2 ** dims)
                        .fill(0)
                        .map((_, index) => `${index}`)
                        .reduce((prev, next) => prev + " " + next)}
                    >
                      <Input.TextArea autoSize={{ minRows: 1 }} />
                    </Form.Item>
                  </Col>
                  {functions.length > 2 ? (
                    <>
                      <Col span={1} />
                      <Col span={1} style={{ alignItems: "end" }}>
                        <Button onClick={() => remove(ind)} danger>
                          X
                        </Button>
                      </Col>
                    </>
                  ) : (
                    <Col span={2} />
                  )}
                </Fragment>
              ))}
              <Col span={21} />
              <Col span={2} style={{ alignItems: "end" }}>
                <Button
                  onClick={() =>
                    add(
                      Array(2 ** dims)
                        .fill(0)
                        .map((_, index) => `${index}`)
                        .reduce((prev, next) => prev + " " + next)
                    )
                  }
                >
                  Добавить
                </Button>
              </Col>
              <Col span={1} />
            </>
          )}
        </Form.List>
      </Row>
      <Row justify="space-between">
        <Col>
          {isEvaluating ? (
            <Row align="middle">
              <Button
                onClick={() => abortingEval.abort()}
                danger
                icon={<LoadingOutlined />}
              >
                Отменить
              </Button>
              <Typography.Text style={{ marginLeft: 10 }}>
                {getStatus(status, maxConst)}
              </Typography.Text>
            </Row>
          ) : (
            <Button htmlType="submit">Посчитать</Button>
          )}
        </Col>
        <Col>{deleteButton}</Col>
      </Row>
      {answer !== undefined ? (
        <Row align="middle" style={{ marginTop: 10 }}>
          {answer.map((row, p1) => (
            <Fragment key={p1}>
              {row.map((ans, p2) => (
                <Fragment key={p2}>
                  <Col span={24}>
                    <Typography.Title style={{ marginBlock: 0 }} level={4}>
                      Подстановки {p1 + 1} и {p1 + p2 + 2}.
                    </Typography.Title>
                  </Col>
                  <Col span={2}>
                    <Typography.Title style={{ marginBlock: 0 }} level={5}>
                      Ответ:
                    </Typography.Title>
                  </Col>
                  <Col span={22}>
                    <Typography.Text style={{ marginBlock: 0 }}>
                      {ans !== null ? "Являются" : "Не являются"} аффинными
                    </Typography.Text>
                  </Col>
                  {ans !== null && (
                    <>
                      <Col span={2}>
                        <Typography.Text>A:</Typography.Text>
                      </Col>
                      <Col span={10}>
                        <Row>
                          <Typography.Text>
                            {Array(2 ** dims)
                              .fill(0)
                              .map((_, index) => `${index}`)
                              .reduce((prev, next) => prev + " " + next)}
                          </Typography.Text>
                        </Row>
                        <Row>
                          <Typography.Text>{ans.A}</Typography.Text>
                        </Row>
                      </Col>
                      <Col span={2}>
                        <Typography.Text>B:</Typography.Text>
                      </Col>
                      <Col span={10}>
                        <Row>
                          <Typography.Text>
                            {Array(2 ** dims)
                              .fill(0)
                              .map((_, index) => `${index}`)
                              .reduce((prev, next) => prev + " " + next)}
                          </Typography.Text>
                        </Row>
                        <Row>
                          <Typography.Text>{ans.B}</Typography.Text>
                        </Row>
                      </Col>
                    </>
                  )}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </Row>
      ) : (
        <Row>
          <Typography.Text>
            {getTimeRemaining(status, maxConst, timeDiff)}
          </Typography.Text>
        </Row>
      )}
    </Form>
  );
};

const getStatus = (
  status: EvaluatingStatus,
  maxConst: { matrixes: number; affineFuncs: number; affineFind: number }
) => {
  switch (status.type) {
    case "genAffineMatrixes":
      return `Генерируем матрицы: ${status.value}/${maxConst.matrixes}`;
    case "genAffineFuncs":
      return `Генерируем аффинные преобразования: ${status.value}/${maxConst.affineFuncs}`;
    case "checkingAffineEq":
      return `Проверяем на аффинную эквивалентность: ${status.value}/${maxConst.affineFind}`;
    default:
      return "";
  }
};

const getTimeRemaining = (
  status: EvaluatingStatus,
  maxConst: { matrixes: number; affineFuncs: number; affineFind: number },
  timeDiff: {
    diff: number;
    time: number;
  }
) => {
  switch (status.type) {
    case "genAffineMatrixes":
      return timeDiff.diff !== 0
        ? `Времени осталось: [${formattedTime(
            Math.ceil(
              (timeDiff.time / timeDiff.diff) *
                (maxConst.matrixes - +status.value)
            )
          )}]`
        : "Времени осталось: считаем";
    case "genAffineFuncs":
      return timeDiff.diff !== 0
        ? `Времени осталось: [${formattedTime(
            Math.ceil(
              (timeDiff.time / timeDiff.diff) *
                (maxConst.affineFuncs - +status.value)
            )
          )}]`
        : "Времени осталось: считаем";
    case "checkingAffineEq":
      return timeDiff.diff !== 0
        ? `До полной проверки осталось: [${formattedTime(
            Math.ceil(
              (timeDiff.time / timeDiff.diff) *
                (maxConst.affineFind - +status.value)
            )
          )}]`
        : "Времени осталось: считаем";
    default:
      return "";
  }
};

const formattedTime = (time: number) => {
  time = Math.floor(time / 1000);
  const sec = time % 60;
  time = Math.floor(time / 60);
  const minutes = time % 60;
  time = Math.floor(time / 60);
  const hours = time % 24;
  const days = Math.floor(time / 24);
  if (days !== 0) return `${days}д ${hours}ч ${minutes}м ${sec}с`;
  if (hours !== 0) return `${hours}ч ${minutes}м ${sec}с`;
  if (minutes !== 0) return `${minutes}м ${sec}с`;
  return `${sec}с`;
};

export default AffineForm;
