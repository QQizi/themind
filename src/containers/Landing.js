import React, { Component } from "react";
import firebase from "firebase";
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import _ from "underscore";

//REDUX
import { connect } from "react-redux";
import * as actions from "./../actions";
import '../css/font.css';

import Header from "./../components/Header";

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false, createName : '', howMuchPlayer : 2};

    this.checkCreateRoom = this.checkCreateRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
  }


  componentWillReceiveProps(nextProps){
    if(!this.props.OpenCreateRoom && nextProps.OpenCreateRoom){
      this.setState({ visible: true });
    }else if(!nextProps.OpenCreateRoom){
      this.setState({ visible: false });
    }

    if(nextProps.User.data != null && nextProps.User.data.activeRoom){
      this.props.history.push('/room/'+nextProps.User.data.activeRoom)
    }
  }

  hide() {
    this.props.openCreateRoom(false);
  }

  checkCreateRoom(){
    if(this.state.createName.length > 0){
      this.props.createRoom({
        name : this.state.createName,
        howMuchPlayer : this.state.howMuchPlayer,
        userID : this.props.User.id
      })
    }
  }

  async joinRoom(){
    if(this.state.join_room_name.length > 0) {
      //Check if room exist
      let isRoom = await firebase.database().ref('/rooms/' + this.state.join_room_number).once('value');
      if(isRoom.val() != null){
        let room = isRoom.val();
        if(room.howMuchPlayer > _.size(room.players)){
          //Room not full, join
          this.props.joinRoom({
            roomId : this.state.join_room_number,
            playerName : this.state.join_room_name,
            userID : this.props.User.id,
            room : room
          })
        }else{
          //TODO Deal with error message
        }
      }
    }
  }

  render() {
    return (
        <div>
          <Header/>
          <div className="container center">
            <div className="row" style={{paddingTop:20}}>
              <div className="input-field col s12">
                <input id="room" type="text" className="validate" name="join_room_number" onChange={evt => this.updateInputValue(evt)}/>
                <label htmlFor="room">Room number</label>
              </div>
              <div className="input-field col s12">
                <input id="name" type="text" className="validate" name="join_room_name" onChange={evt => this.updateInputValue(evt)}/>
                <label htmlFor="name">Your name</label>
              </div>
              <button className="btn waves-effect waves-light" type="submit" name="action" onClick={this.joinRoom}>Join room
                <i className="material-icons right">send</i>
              </button>
              <Rodal height={300} animation={'slideUp'} visible={this.state.visible} onClose={this.hide.bind(this)}>
                <div className="container center">
                  <div className="input-field col s12">
                    <input id="create_name" type="text" className="validate" name="createName" value={this.state.createName} onChange={evt => this.updateInputValue(evt)}/>
                    <label htmlFor="create_name">Your name</label>
                  </div>
                  <div className="input-field col s12">
                    <select className="browser-default" name="howMuchPlayer" value={this.state.howMuchPlayer} onChange={evt => this.updateInputValue(evt)}>
                      <option value="" disabled>How many players</option>
                      <option value="2" defaultValue>2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                  <button onClick={this.checkCreateRoom} className="btn waves-effect waves-light" type="submit" name="action">Join room
                    <i className="material-icons right">send</i>
                  </button>
                </div>
              </Rodal>
            </div>
          </div>
        </div>
    );
  }

  updateInputValue(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }
}

const mapStateToProps = (state,props)=> {
  return {
    User : state.auth,
    OpenCreateRoom : state.openCreateRoom,
    room : state.createRoom,
  };
};

const mapDispatchToProps = dispatch =>{
  return {
    fetchUser: () => {
      dispatch(actions.fetchUser())
    },
    openCreateRoom: (bool) => {
      dispatch(actions.openCreateRoom(bool))
    },
    createRoom: (data) => {
      dispatch(actions.createRoom(data))
    },
    joinRoom: (data) => {
      dispatch(actions.joinRoom(data))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Landing);