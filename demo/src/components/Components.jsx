import React, { PropTypes } from 'react'

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
                {comp.connects.length ? <div>connects:</div> : null}
                <ul>
                  {
                    comp.connects.map(c =>
                      <li>
                        {
                          Object.keys(c.data.mapStateToProps.data).map(
                            key => c.data.mapStateToProps.data[key].model
                          )
                        }
                      </li>
                    )
                  }
                </ul>
              </li>
            )
          }
        </ul>
      </div>
    );
  }
}

export default Components;
