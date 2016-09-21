import React, { PropType } from 'react';

function A(props) {

  function handleClick() {
    props.dispatch({ type: 'count/add' });
  }

  return (
    <div>Dispatch</div>
  );
}

function B({ dispatch }) {

  function handleClick() {
    dispatch({ type: 'count/add' });
    dispatch({ type: 'app/hideLoading' });
  }

  return (
    <div>Dispatch</div>
  );
}
