import { CREATE_ROOM, OPEN_CREATE_ROOM, UPDATE_ROOM, JOIN_ROOM } from "../actions/types";

export const openCreateRoom = (state = false, {type, payload} = {}) => {
  switch (type) {
    case OPEN_CREATE_ROOM:
      return payload;
    default:
      return state
  }
};

export const createRoom = (state = false, {type, payload} = {}) => {
  switch (type) {
    case CREATE_ROOM:
      return payload;
    default:
      return state
  }
};

export const joinRoom = (state = null, {type, payload} = {}) => {
  switch (type) {
    case JOIN_ROOM:
      return payload;
    default:
      return state
  }
};


export const updateRoom = (state = null, {type, payload} = {}) => {
  switch (type) {
    case UPDATE_ROOM:
      return payload;
    default:
      return state
  }
};
