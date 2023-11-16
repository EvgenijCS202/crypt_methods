import { Button, Col, Form, Input, InputNumber, Row, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";

interface IDiffFormProps {
  index: number;
  deleteButton?: JSX.Element;
}
const DiffForm = ({ index, deleteButton }: IDiffFormProps) => {
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
      .map(() =>
        Array(2 ** n - 1)
          .fill(0)
          .map(() => 0)
      );
    for (let a = 1; a < 2 ** n; a++)
      for (let x = 0; x < 2 ** n; x++) {
        const b = boolFunction[x ^ a] ^ boolFunction[x];
        if (b === 0) continue;
        data[a - 1][b - 1]++;
      }
    setAnswer(Math.max(...data.flat()) / 2 ** n);
  };

  return (
    <Form form={form} onFinish={onFormFinished}>
      <Row>
        <Col span={24}>
          <Typography.Title level={5}>
            Разностная характеристика {index + 1}
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
              Разностная характеристика = {answer}
            </Typography.Text>
          </Col>
        </Row>
      )}
    </Form>
  );
};

export default DiffForm;
