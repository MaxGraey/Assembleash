
import React    from 'react';
import ReactDOM from 'react-dom';
import App      from './App';

import registerServiceWorker from './registerServiceWorker';

import './index.css'
import './bootstrap.theme.css'
import './toggle.button.css'
import './monaco.css'

ReactDOM.render(<App/>, document.getElementById('root'));
registerServiceWorker();
