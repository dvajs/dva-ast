import React, { PropTypes } from 'react';

class Editor extends React.Component {
  render() {
    const { source } = this.props;
    return (
      <div>
        <textarea
          value={source}
          rows="5"
          cols="80"
          onChange={(e) => {
            this.props.onChange(e.target.value);
          }}
        />
      </div>
    );
  }
}

export default Editor;
