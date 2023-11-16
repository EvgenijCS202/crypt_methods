import { Form, Row, Col, Typography, InputNumber, Input, Button } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";

interface ILinearFormProps {
  index: number;
  deleteButton?: JSX.Element;
}
const LinearForm = ({ index, deleteButton }: ILinearFormProps) => {
  const [form] = useForm();
  const [dims, setDims] = useState(3);
  const [answer, setAnswer] = useState<number | null>(null);

  useEffect(() => {
    form.setFieldValue(
      "function",
      Array(2 ** dims)
        .fill(0)
        .map((_, index) => `${index}`)
        .reduce((prev, next) => prev + " " + next)
    );
  }, [form, dims]);

  const onFormFinished = (values: { dims: number; function: string }) => {
    const n = values.dims;
    const boolFunction = values.function.split(" ").map((num) => +num);
    const data = Array(2 ** n - 1)
      .fill(0)
      .map((_, a) =>
        Array(2 ** n - 1)
          .fill(0)
          .map((_, b) => {
            let matches = 0;
            for (let x = 0; x < 2 ** n; x++) {
              if (
                binaryScalar(x, a + 1) === binaryScalar(boolFunction[x], b + 1)
              )
                matches++;
            }

            return matches;
          })
      );
    setAnswer(Math.max(...data.flat()) / 2 ** (n - 1) - 1);
  };

  return (
    <Form form={form} onFinish={onFormFinished}>
      <Row>
        <Col span={24}>
          <Typography.Title level={5}>
            Линейная характеристика {index + 1}
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
              value={dims}
              onChange={(value) => setDims(value || 3)}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Typography.Text>
            Введите вектор выходных значений для входных:
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
            name="function"
            initialValue={Array(2 ** dims)
              .fill(0)
              .map((_, index) => `${index}`)
              .reduce((prev, next) => prev + " " + next)}
          >
            <Input.TextArea autoSize={{ minRows: 1 }} />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="space-between">
        <Button htmlType="submit">Посчитать</Button>
        {deleteButton}
      </Row>
      {answer && (
        <Row align="middle" style={{ marginTop: 10 }}>
          <Col span={2}>
            <Typography.Title style={{ marginBlock: 0 }} level={5}>
              Ответ:
            </Typography.Title>
          </Col>
          <Col span={22}>
            <Typography.Text style={{ marginBlock: 0 }}>
              Линейная характеристика = {answer}
            </Typography.Text>
          </Col>
        </Row>
      )}
    </Form>
  );
};

const binaryScalar = (x: number, y: number) => {
  let result = 0;
  while (x !== 0 && y !== 0) {
    result += (x & 1) * (y & 1);
    x >>>= 1;
    y >>>= 1;
  }
  return result % 2;
};

export default LinearForm;
