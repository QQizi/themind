import React, { Component } from "react";
import * as actions from "../actions";
import {connect} from "react-redux";
import firebase from "firebase";

class Card extends Component {
    constructor(props) {
        super(props);
        this.state = {isToggleOn: true};
    }

    componentDidMount() {
        document.ondragover = (evt) => {
            evt = evt || window.event;
            var x = evt.pageX,
                y = evt.pageY;

            var roomMooves = firebase.database().ref('rooms/'+this.props.User.data.activeRoom+'/players/'+this.props.User.id+'/drag');
            roomMooves.transaction((currentMooves) => {
                return {
                    innerWidth : window.innerWidth,
                    innerHeight : window.innerHeight,
                    x : x,
                    y : y,
                    dragging : true
                }
            });
        }

        document.ondragend = (evt) => {
            var roomMooves = firebase.database().ref('rooms/'+this.props.User.data.activeRoom+'/players/'+this.props.User.id+'/drag');
            roomMooves.transaction((currentMooves) => {
                return false
            });
        }
    }

    onDragStart(ev, id){
        ev.dataTransfer.setData("id", id);
    }

    onDrag(ev, id){

    }

    render() {
        if(this.props.isDraggable){
            return (
                <div
                    draggable
                    onDragStart={(e)=>this.onDragStart(e, this.props.val)}
                    onDrag={(e)=>this.onDrag(e, this.props.val)}
                    key={this.props.id}
                    className="playing-card draggable"
                    style={this.props.css}
                >
              <span>
                {this.props.val}
              </span>
                    <span>
                {this.props.val}
              </span>
                </div>
            );
        }else{
            return (
                <div
                    key={this.props.id}
                    className="playing-card"
                    style={this.props.css}
                >
              <span>
                {this.props.val}
              </span>
                    <span>
                {this.props.val}
              </span>
                </div>
            );
        }
    }
}

const mapStateToProps = (state,props)=> {
    return {
        User : state.auth
    };
};

const mapDispatchToProps = dispatch =>{
    return {
        fetchUser: () => {
            dispatch(actions.fetchUser())
        },
        openCreateRoom: (bool) => {
            dispatch(actions.openCreateRoom(bool))
        }
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(Card);
