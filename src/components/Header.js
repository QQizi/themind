import React, { Component } from "react";
import * as actions from "../actions";
import {connect} from "react-redux";

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {isToggleOn: true};

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.openCreateRoom(true);
    }

    render() {
        return (
          <nav>
            <div className="nav-wrapper" style={{paddingLeft:20,paddingRight:20}}>
              <a href="/" className="left brand-logo">
                Logo
              </a>
                <ul id="nav-mobile" className="right hide-on-med-and-down">
                    <li>
                        <button onClick={this.handleClick} className="right btn waves-effect waves-light" type="submit" name="action">Create new room
                            <i className="material-icons right">send</i>
                        </button>
                    </li>
                </ul>
            </div>
          </nav>
        );
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


export default connect(mapStateToProps, mapDispatchToProps)(Header);
