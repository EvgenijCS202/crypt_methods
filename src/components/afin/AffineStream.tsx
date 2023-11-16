import { Button, Col, Row, Typography } from "antd";
import { useState, Fragment } from "react";
import AffineForm from "./AffineForm";

const AffineStream = () => {
  const [, setDiffCount] = useState(1);
  const [diffForms, setDiffForms] = useState([1]);
  return (
    <Row align="middle">
      <Col span={1} />
      <Col span={22}>
        <Row style={{ rowGap: 10 }}>
          <Col span={24}>
            <Typography.Title level={4}>
              Аффинная эквивалентность
            </Typography.Title>
          </Col>
          {diffForms.map((key, index) => (
            <Fragment key={key}>
              <Col span={11}>
                <AffineForm
                  index={index}
                  deleteButton={
                    diffForms.length > 1 ? (
                      <Button
                        danger
                        onClick={() =>
                          setDiffForms([
                            ...diffForms.filter((val) => val !== key),
                          ])
                        }
                      >
                        Удалить
                      </Button>
                    ) : undefined
                  }
                />
              </Col>
              {index % 2 === 0 && <Col span={2} />}
            </Fragment>
          ))}
          <Col span={11} style={{ display: "flex", alignItems: "center" }}>
            <Button
              onClick={() => {
                setDiffCount((val) => {
                  setDiffForms([...diffForms, val + 1]);
                  return val + 1;
                });
              }}
            >
              Добавить
            </Button>
          </Col>
        </Row>
      </Col>
      <Col span={1} />
    </Row>
  );
};

export default AffineStream;
