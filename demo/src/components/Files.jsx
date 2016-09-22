import recast from 'recast';
import React, { PropTypes } from 'react';
import { Card } from 'antd';

class Files extends React.Component {
  render () {
    const { files = {} } = this.props;
    const paths = Object.keys(files);
    return (
      <div>
        {
          paths.map(p =>
            (<Card title={p} key={p} style={{ marginBottom: 15 }}>
              <textarea value={ files[p] } rows="10" cols="200" />
            </Card>)
          )
        }
      </div>
    );
  }
}

export default Files;
