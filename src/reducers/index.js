import { combineReducers } from "redux";
import authReducer from "./authReducer";
import {openCreateRoom, createRoom, updateRoom, joinRoom} from "./roomReducer";

export default combineReducers({
  auth: authReducer,
  openCreateRoom : openCreateRoom,
  createRoom : createRoom,
  updateRoom : updateRoom,
  joinRoom : joinRoom,
});
