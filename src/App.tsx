import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import DiffStream from "./components/diff/DiffStream";
import LinearStream from "./components/linear/LinearStream";
import AffineStream from "./components/afin/AffineStream";

function App() {
  return (
    <Layout>
      <Content>
        <DiffStream />
        <LinearStream />
        <AffineStream />
      </Content>
    </Layout>
  );
}

export default App;
