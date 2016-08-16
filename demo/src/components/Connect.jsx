import React, { PropTypes } from 'react'

class Connect extends React.Component {
  render() {
    const { connects } = this.props;
    return (
      <div>
        connects:
        <ul>
          {
            connects.map((c, i) =>
              <li key={i}>
                {
                  Object.keys(c.data.mapStateToProps.data).map(
                    key => c.data.mapStateToProps.data[key].model
                  )
                }
              </li>
            )
          }
          <li>
            <input />
            <button>add</button>
          </li>
        </ul>
      </div>
    )
  }
}

export default Connect;
