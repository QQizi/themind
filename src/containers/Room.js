import React, { Component } from "react";
import firebase from "firebase";
import 'rodal/lib/rodal.css';
import _ from 'underscore';

//REDUX
import { connect } from "react-redux";
import * as actions from "./../actions";
import '../css/font.css';

import {Utils} from "../scripts/util";
import Card from "../components/Card";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      display : false,
      isDraging : false,
      createName : '',
      howMuchPlayer : 2,
      room : {
        currentLeveL : 0,
        life : 0,
        maxLeveL : 0,
        stars: 0
      },
      players : []
    };

    this.watchRoom = this.watchRoom.bind(this);
  }

  componentDidMount() {
    if(this.props.User != null){
      this.initRoom(this.props.User)
    }
  }

  componentWillReceiveProps(nextProps){
    if(this.props.User == null && nextProps.User != null){
      this.initRoom(nextProps.User)
    }

    if(nextProps.room != null && nextProps.room != this.props.room){
      this.setState({
        room : nextProps.room,
        display : true
      }, ()=>{
        this.watchRoom();
      })
    }
  }

  initRoom(User){
    //Get room infos
    firebase.database().ref('/rooms/'+User.data.activeRoom).on('value', (snap) => {
      this.props.updateRoom(snap.val())
    });
  }

  watchRoom(){
    //Check if players are online
    _.mapObject(this.state.room.players,(val, key) => {
      firebase.database().ref('/users/'+key).on('value', (snap) => {
        this.setState(prevState => {
          return {players: {...prevState.players, [key]: {
            online : snap.val().online,
            name : snap.val().name,
          }}};
        });
      });

      //Check if other player moove there cards
      if(key !== this.props.User.id){
        this.watchMoove(key);
      }

    });
  }

  watchMoove(key){
    //TODO Moove card of other players
    firebase.database().ref('/rooms/'+this.props.User.data.activeRoom+'/players/'+key+'/drag').on('value', (snap) => {
      if(typeof snap.val() != "undefined" && snap.val() != false){
        this.setState({
          isDraging : true,
          dragInfos : snap.val()
        })
      }
    });
  }

  async clickCard(valuePlayedCard){
    //Set moove transaction
    var roomMooves = firebase.database().ref('rooms/'+this.props.User.data.activeRoom+'/mooves');
    roomMooves.transaction((currentMooves) => {

      let nextMooves = (currentMooves != null)?currentMooves:[];
      let history = (typeof this.state.room.history != "undefined")?this.state.room.history:[];

      //Check if current played card is lower than the others still in hand
      let cardIsTheLowest = true;
      _.map(this.state.room.players, (player) => {
        _.map(player.cards, (card) => {
          if(valuePlayedCard > card){
            cardIsTheLowest = false;
          }
        });
      });

      if(cardIsTheLowest){
        //Add moove into history
        history.push(this.props.User.data.name+' played the card #'+valuePlayedCard);
        var updatesHistory = {};
        updatesHistory['/history'] = history;
        firebase.database().ref('/rooms/'+this.props.User.data.activeRoom).update(updatesHistory);
      }else{
        //The current card is not the lowest
        var updatesLife = {};
        updatesLife['/life'] = this.state.room.life - 1;
        firebase.database().ref('rooms/'+this.props.User.data.activeRoom).update(updatesLife);

        //Loop through all the players card and remove cards lower than current played card
        _.map(this.state.room.players, (player) => {
          let playerCards = player.cards;
          let howManyToDelete = 0;
          _.map(player.cards, (card) => {
            if(card < valuePlayedCard){
              howManyToDelete++

              nextMooves.push(card);
            }
          });

          playerCards.splice(0,howManyToDelete);
          var updatesPlayersHand = {};
          updatesPlayersHand['/cards'] = playerCards;
          firebase.database().ref('/rooms/'+this.props.User.data.activeRoom+"/players/"+player.userId).update(updatesPlayersHand);
        });

        //Add moove into history
        history.push(this.props.User.data.name+' played the card #'+valuePlayedCard+' but it wasn\'t the lowest card');
        history.push('You now have '+(this.state.room.life -1)+' life');
        var updates = {};
        updates['/history'] = history;
        firebase.database().ref('/rooms/'+this.props.User.data.activeRoom).update(updates);
      }

      //Delete current card from player hand
      let clonedCards = _.clone(this.state.room.players[this.props.User.id].cards);
      clonedCards.shift()
      var updatesHand = {};
      updatesHand['/cards'] = clonedCards;
      firebase.database().ref('/rooms/'+this.props.User.data.activeRoom+"/players/"+this.props.User.id).update(updatesHand);

      //Add card into mooves
      nextMooves.push(valuePlayedCard);

      //Check if number of mooves is equal to total cards
      if(nextMooves.length === this.state.room.alocatedNumbers.length){
        //Level is finished
        let room = this.state.room;
        let currentLevel = room.currentLeveL;

        if(currentLevel === room.maxLeveL){
          //Game is finished
          alert("Woop Woop. Goodjob, you won !");
          //Add moove to history
          history.push('You finished the game ! Good job !');
          var updatesHistory = {};
          updatesHistory['/history'] = history;
          firebase.database().ref('/rooms/'+this.props.User.data.activeRoom).update(updatesHistory);
        }else{
          history.push('You finished the level #'+currentLevel+', get ready for the next one');
          var updatesHistory = {};
          updatesHistory['/history'] = history;
          firebase.database().ref('/rooms/'+this.props.User.data.activeRoom).update(updatesHistory);

          //Switch through rewards
          switch (currentLevel) {
            case currentLevel === 2:
              room.stars = room.stars +1;
            case currentLevel === 3:
              room.life = room.life +1;
            case currentLevel === 5:
              room.stars = room.stars +1;
            case currentLevel === 6:
              room.life = room.life +1;
            case currentLevel === 8:
              room.stars = room.stars +1;
            case currentLevel === 9:
              room.life = room.life +1;
          }

          //++ active level
          room.currentLeveL = room.currentLeveL + 1;

          //Shuffle new cards
          room.alocatedNumbers = Utils.randomDataSet(room.currentLeveL * room.howMuchPlayer, 1, 100).sort((a,b)=>{return a-b});

          //Distribute cards to players
          room.alocatedNumbers = _.shuffle(room.alocatedNumbers);
          let chunkedArray = Utils.chunkArray(room.alocatedNumbers, room.currentLeveL);

          let playersArray = Utils.objToArr(room.players);

          for(var i = 0; i <= playersArray.length-1; i++){
            room.players[playersArray[i].key].cards = chunkedArray[i].sort((a,b)=>{return a-b});
          }

          room.mooves = false;

          //Update room
          firebase.database().ref('/rooms/'+this.props.User.data.activeRoom).set(room);

          nextMooves = [];
        }
      }

      return nextMooves;
    });
  }

  displayPlayedCards(){
    if(this.state.display && typeof this.state.room.mooves != "undefined"){
      return (
          <div>
            <div className="playing-card">
            <span>
              {this.state.room.mooves[this.state.room.mooves.length-1]}
            </span>
              <span>
              {this.state.room.mooves[this.state.room.mooves.length-1]}
            </span>
            </div>
          </div>
      )
    }
  }

  displayCard(){
    if(this.state.display && typeof this.state.room.players[this.props.User.id].cards != "undefined"){
      let tempCards = _.clone(this.state.room.players[this.props.User.id].cards);
      let playerCards = tempCards.reverse();
      let middleNumber = (playerCards.length-1)/2;
      let isMiddle = middleNumber % 2 === 0;

      let css = {
        transform: 'rotate(-'+(Math.ceil(Math.abs(middleNumber)))*5+'deg)'
      }
      return (
          <div style={css}>
            {
              _.map(playerCards, (val, key) => {
                let side = (key < middleNumber)?'left':(key > middleNumber)?'right':'center';
                let howFar = Math.ceil(Math.abs(middleNumber - key));

                let css = {};
                if(side == 'left'){
                  css = {
                    transform: 'rotate('+(howFar*15)+'deg)'
                  }
                }else if(side == "right"){
                  css = {
                    transform: 'rotate(-'+(((isMiddle)?howFar:howFar-1)*15)+'deg)'
                  }
                }

                if(val == _.last(playerCards)){
                  return (
                      <Card key={key} id={key} val={val} css={css} isDraggable={true}></Card>
                  )
                }else{
                  return (
                      <Card key={key} id={key} val={val} css={css} isDraggable={false}></Card>
                  )
                }

              })
            }
          </div>
      )
    }
  }

  displayPlayers(){
    return (
        <div>
          {
            _.map(this.state.players, (val, key) => {
              return (
                  <li key={key}>
                    <div>
                      <p>{val.name}</p>
                      <span className={(val.online)?'online':'offline'}></span>
                    </div>
                    <div>
                      Remaining cards : {(typeof this.state.room.players[key].cards != "undefined")?this.state.room.players[key].cards.length:0}
                    </div>
                  </li>
              )
            })
          }
        </div>
    )
  }

  displayHistory(){
    if(this.state.display && typeof this.state.room.history != "undefined"){
      let history = _.clone(this.state.room.history);
      return (
          <ul>
            {
              _.map(history.reverse(), (val, key) => {
                return (
                    <li key={key}>
                      {val}
                    </li>
                )
              })
            }
          </ul>
      )
    }
  }

  onDragOver(ev){
    ev.preventDefault();
  }

  onDrop = (ev, cat) => {
    this.clickCard(ev.dataTransfer.getData("id"))
  }

  render() {
    return (
        <div className="container center" /*onMouseMove={this._onMouseMove.bind(this)}*/>
          <div className="displayLevel">
            Round #{this.state.room.currentLeveL}
          </div>
          <div className="stats">
            <ul>
              <li>
                <p>Current level : {this.state.room.currentLeveL}</p>
              </li>
              <li>
                <p>Number of Life : {this.state.room.life}</p>
              </li>
              <li>
                <p>Max level : {this.state.room.maxLeveL}</p>
              </li>
              <li>
                <p>Throwing stars : {this.state.room.stars}</p>
              </li>
            </ul>
          </div>
          <div className="players">
            <ul>
              {this.displayPlayers()}
            </ul>
          </div>
          <div className="myHand">
            {this.displayCard()}
          </div>
          <div
              className="playedCards"
              onDragOver={(e)=>this.onDragOver(e)}
              onDrop={(e)=>this.onDrop(e, "complete")}
          >
            {this.displayPlayedCards()}
          </div>
          <div className="history">
            {this.displayHistory()}
          </div>
        </div>
    );
  }
}

const mapStateToProps = (state,props)=> {
  return {
    User : state.auth,
    OpenCreateRoom : state.openCreateRoom,
    room : state.updateRoom,
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
    updateRoom: (room) => {
      dispatch(actions.updateRoom(room))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);