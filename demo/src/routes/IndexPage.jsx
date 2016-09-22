import React, { Component, PropTypes } from 'react';
import { Card, Col, Row, Tabs, Icon } from 'antd';
import { connect } from 'dva';
import Components from '../components/Components';
import Actions from '../components/Actions';
import Effects from '../components/Effects';
import Reducers from '../components/Reducers';
import States from '../components/States';
import Files from '../components/Files';

class IndexPage extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'ast/query',
    });
  }
  createComponent = () => {
    this.props.dispatch({
      type: 'ast/component/create',
      payload: {
        componentName: 'Test',
        filePath: 'routes/Test.jsx'
      }
    })
  }
  removeComponent = (id) => {
    this.props.dispatch({
      type: 'ast/component/remove',
      payload: {
        id,
      }
    })
  }
  updateComponent = (id, source) => {
    this.props.dispatch({
      type: 'ast/component/update',
      payload: {
        id,
        source,
      }
    })
  }
  render() {
    const { ast, fileInfo } = this.props;
    const { components, models, effects, reducers, dispatches, loading } = ast;
    return (
      <div>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="FBP" key="1">
            <Row type="flex" justify="space-between" style={{ marginBottom: 20 }}>
              <Col span="5">
                <Card title="Components"  extra={<a onClick={this.createComponent}>+ create</a>}>
                  <Components
                    comps={components}
                    removeComponent={this.removeComponent}
                    updateComponent={this.updateComponent}
                  />
                </Card>
              </Col>

              <Col span="5">
                <Card title="Actions" style={{ marginBottom: 20 }}>
                  <Actions dispatches={dispatches} />
                </Card>
                <Card title="Effects" style={{ marginBottom: 20 }}>
                  <Effects effects={effects} />
                </Card>
                <Card title="Models">
                  <States models={models} />
                </Card>
              </Col>

              <Col span="12">
                <Card title="Reducers">
                  <Reducers reducers={reducers} />
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Editor" key="2">
            <Files files={fileInfo} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect(
  ({ ast }) => ({ ast })
)(IndexPage);
