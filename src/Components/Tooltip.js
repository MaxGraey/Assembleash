import React   from 'react';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import moize   from 'moize';

export default moize.react(
  (desc = '') => <Tooltip id='tooltip'><h4>{ desc }</h4></Tooltip>
);
