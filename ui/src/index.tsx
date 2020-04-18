import * as React from "react";
import * as ReactDOM from "react-dom";
import {Provider} from 'react-redux'
import {App} from "./components/App";
import createStore from "./store";


ReactDOM.render(
  <Provider store={createStore({})}>
    <App/>
  </Provider>,
  document.getElementById("app")
);