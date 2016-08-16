import React, { PropTypes } from 'react'

class Components extends React.Component {
  render() {
    const { comps = [] } = this.props;
    return (
      <div>
        <ul>
          {
            comps.map(comp =>
              <li key={comp.filePath}>{comp.componentName}</li>
            )
          }
        </ul>
      </div>
    );
  }
}

export default Components;
