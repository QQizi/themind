import { FETCH_USER, CREATE_ROOM, OPEN_CREATE_ROOM, UPDATE_ROOM, JOIN_ROOM } from "./types";
import firebase from "firebase";
import {Utils} from "../scripts/util";

export const fetchUser = () => async dispatch => {
  firebase.auth().onAuthStateChanged(user =>{
    if(user){
      firebase.database().ref('/users/'+user.uid).on('value', function(snap) {
        dispatch({ type: FETCH_USER, payload: {id:user.uid,data :snap.val()}})
      });
    }
  });
};

export const createRoom = (data) => async dispatch => {

  var newRoom = await firebase.database().ref().child('rooms').push().key;
  var updates = {};

  var numberAlocated = Utils.randomDataSet(1, 1, 100);

  updates['/howMuchPlayer'] = data.howMuchPlayer;
  updates['/currentLeveL'] = 1;
  updates['/maxLeveL'] = (data.howMuchPlayer == 3)?10:(data.howMuchPlayer == 4)?8:12;
  updates['/life'] = (data.howMuchPlayer == 3)?3:(data.howMuchPlayer == 4)?4:2;
  updates['/stars'] = 1;
  updates['/alocatedNumbers'] = numberAlocated.sort((a,b)=>{return a-b});
  updates['/players/'+data.userID] = {
    cards : numberAlocated.sort((a,b)=>{return a-b}),
    name : data.name,
    userId : data.userID
  };


  firebase.database().ref('/rooms/'+newRoom).update(updates);


  var playerData = {
    name: data.name,
    activeRoom : newRoom
  };
  firebase.database().ref('users/' + data.userID).update(playerData);

  firebase.database().ref('/rooms/'+newRoom).on('value', function(snap) {
    dispatch({ type: CREATE_ROOM, payload: snap.val() })
  });
};

export const joinRoom = (data) => async dispatch => {
  let numberAlocated = Utils.randomDataSet(1, 1, 100);

  var updates = {};

  updates['/alocatedNumbers'] = (data.room.alocatedNumbers.concat(numberAlocated)).sort((a,b)=>{return a-b});
  updates['/players/'+data.userID] = {
    cards : numberAlocated.sort((a,b)=>{return a-b}),
    name : data.playerName,
    userId : data.userID
  };

  firebase.database().ref('/rooms/'+data.roomId).update(updates);

  var playerData = {
    name: data.playerName,
    activeRoom : data.roomId
  };
  firebase.database().ref('users/' + data.userID).update(playerData);

  firebase.database().ref('/rooms/'+data.roomId).on('value', function(snap) {
    dispatch({ type: JOIN_ROOM, payload: snap.val() })
  });
};


export const openCreateRoom = (isOpen) => async dispatch => {
  dispatch({ type: OPEN_CREATE_ROOM, payload: isOpen })
};


export const updateRoom = (room) => async dispatch => {
  dispatch({ type: UPDATE_ROOM, payload: room })
};
