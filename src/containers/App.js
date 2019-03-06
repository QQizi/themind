import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import firebase from "firebase";

//COMPONENTS
import Landing from "../containers/Landing";
import Room from "../containers/Room";

//REDUX
import { connect } from "react-redux";
import * as actions from "./../actions";

class App extends Component {
  componentDidMount() {
    this.props.fetchUser();
    firebase.auth().signInAnonymously();
  }

  checkForOnline(User){
    //Update user online status
    var connectedRef = firebase.database().ref(".info/connected");
    var userRef = firebase.database().ref('users/' + User.id+'/online');
    connectedRef.on("value", (snapshot) => {
      if (snapshot.val()) {
        userRef.onDisconnect().set(false);
        userRef.set(true);
      }
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if(nextProps.User != null && this.props.User == null){
      this.checkForOnline(nextProps.User);
    }
  }


  render() {
    return (
      <BrowserRouter>
        <div id={'root-div'}>
          <Route path="/" exact component={Landing} />
          <Route path="/room/:id" exact component={Room} />
        </div>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state)=> {
  return {
    User : state.auth
  };
};

const mapDispatchToProps = dispatch =>{
  return {
    fetchUser: () => {
      dispatch(actions.fetchUser())
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);