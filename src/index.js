import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import reduxThunk from "redux-thunk";

//CONTAINERS
import App from "./containers/App";

//REDUCERS
import reducers from "./reducers";

//CSS
import "materialize-css/dist/css/materialize.min.css";
import "materialize-css/dist/js/materialize.min";

//SETUP
import './config/firebase'

let middleware = [
    reduxThunk
];

middleware = [
    ...middleware,
    //createLogger()
];


const store = createStore(reducers, {}, applyMiddleware(...middleware));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
