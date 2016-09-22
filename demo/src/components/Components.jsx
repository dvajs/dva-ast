import React, { PropTypes } from 'react';
import Connect from './Connect';

class Components extends React.Component {
  render() {
    const { comps = [] } = this.props;
    return (
      <div>
        <ul>
          {
            comps.map(comp =>
              <li key={comp.filePath}>
                {comp.componentName}
                <a onClick={() => this.props.removeComponent(comp.id)}>x remove</a>
                <a onClick={() => this.props.updateComponent(comp.id, comp.source)}>u update</a>
                <Connect stateMappings={comp.stateMappings} />
              </li>
            )
          }
        </ul>
      </div>
    );
  }
}

export default Components;
