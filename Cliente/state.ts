import { rtdb, firestore } from "../Server/database";
import { ref, onValue } from "firebase/database";
import {Router} from "../Cliente/router";


const API_BASE_URL = "http://localhost:3001";

type Play = "paper" | "rock" | "scissors";

const state = {
  data: {
    currentGame: {
      onlineOwer: false,
      online: false, 
      userEmail: "",
      name: "",
      rtdbId: "",
      longrtdbId: "",
      firestoreId: "",
      roomFirestoreID: "",
      moveIds:[],
      rtdbData: {}
    },
    history: {
      myScore: 0,
      computerScore: 0,
    },
  },
  listeners: [],

//Return this.data
  getState() {
    return this.data;
  },
//Set all state
  setState(newState) {
    this.data = newState;
    for (const cb of this.listeners) {
      cb();
    }
    // this.savedData();
  },
//Set email and name at state
  setEmailAndName(email: string, name: string) {
    const currentState = this.getState();
    currentState.currentGame.userEmail = email;
    currentState.currentGame.name = name;
    this.setState(currentState);
  }, 
//Set user firestoreID at State
  setFirestoreId(id) {
    const currentState = this.getState();
    currentState.currentGame.firestoreId = id;
    this.setState(currentState);
  },
  //Set firestore Room ID at State
  setFirestoreRoomId(id){
    const currentState = this.getState();
    currentState.currentGame.roomFirestoreID = id;
    this.setState(currentState);
  },
//Set user  short RealTimeDataBaseID
  setRtdbId(rtdbId) {
    const currentState = this.getState();
    currentState.currentGame.rtdbId = rtdbId;
    this.setState(currentState);
  },
//Authenticate user. If exists returns id
  authentication() {
    const cs = this.getState();
    if (cs.currentGame.userEmail) {
      return fetch(API_BASE_URL + "/auth", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail: cs.currentGame.userEmail }),
      })

    } else {
      console.error("No existe el email");
    }
  },
//Create a new user at Firestore
  createUserAtFirestore() {
    const cs = this.getState();
    const userName = cs.currentGame.name;
    const userEmail = cs.currentGame.userEmail;  
    return fetch(API_BASE_URL + "/signup", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: userName,
        userEmail: userEmail,
        owner: true,
      }),
    })
  },
// Create a room if the user exists
  createRoom() {
    const cs = state.getState();
    if (cs.currentGame.firestoreId) {
      return fetch(API_BASE_URL + "/room", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: cs.currentGame.firestoreId
        }),
      })
        
    } else {
      console.error("El id ingresado no existe");
    }
  },
//Create roomCollection at Firestore
  createRoomAtFirestore(){
    const cs = this.getState();
    if (cs.currentGame.rtdbId && cs.currentGame.longrtdbId) {
      return fetch(API_BASE_URL + "/create_room_firestore", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          shortRtdbId: cs.currentGame.rtdbId,
          longRtdbId: cs.currentGame.longrtdbId
        })
      })
    } else {
      console.log("Faltan los Id's")
    }
  },
//Conect to a room and change online status
  changeStatus() {
    const cs = this.getState()
    if (cs.currentGame.longrtdbId){
      return fetch (API_BASE_URL + '/change_status', {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          longRtdbtID: cs.currentGame.longrtdbId,
        })
      })
    } else {
      console.log("id no encontrado")
    }
  },
  //Change "start" flag.
  changeStartStatus() {
    const cs = this.getState()
    if (cs.currentGame.longrtdbId){
      return fetch (API_BASE_URL + '/change_start_status', {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          longRtdbtID: cs.currentGame.longrtdbId,
        })
      })
    } else {
      console.log("id no encontrado")
    }
  },
//Verify shortID and return longID
  authenticateRoom(shortID: string){
    const cs = this.getState()
    return fetch (API_BASE_URL + "/auth_room",{
      method: "POST",
        mode: "cors",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          shortRtdbId: shortID,
        })
      })
  }, 
//Listen to a room at Real Time Data Base waiting.
  waitingConnection() {
    const cs = this.getState()
    if (cs.currentGame.longrtdbId){
      console.log('Esperando conección, se creo un nuevo room con este rtdbID', cs.currentGame.longrtdbId)
      const chatRoomRef = ref(rtdb, 'Rooms/' + cs.currentGame.longrtdbId);
      onValue(chatRoomRef, (snapshot) => {
        const data = snapshot.val();
        cs.currentGame.rtdbData = data
        this.setState(cs)
        if (data.onlineGuest == true) {
          Router.go('/instructions')
        } else {
          onValue(chatRoomRef, (snapshot)=>{
            const data = snapshot.val();
            cs.currentGame.rtdbData = data
            this.setState(cs)
          })
        }
      });
    } else {
      console.log("id no encontrado")
    }
  },
  waitingForStartChange() {
    const cs = this.getState()
    if (cs.currentGame.longrtdbId){
      const chatRoomRef = ref(rtdb, 'Rooms/' + cs.currentGame.longrtdbId);
      onValue(chatRoomRef, (snapshot) => {
        const data = snapshot.val();
        cs.currentGame.rtdbData = data
        this.setState(cs)
        if (data.start == true) {
          Router.go('/game')
        } else {
          onValue(chatRoomRef, (snapshot)=>{
            const data = snapshot.val();
            cs.currentGame.rtdbData = data
            this.setState(cs)
          })
        }
      });
    } else {
      console.log("id no encontrado")
    }
  },
  suscribe(callback: (any) => any) {
    this.listeners.push(callback);
  },
  //Set move at Firestore
  setMoveAtFirestore(move:{}, longrtdbId){
    const cs = this.getState()
    if (cs.currentGame.longrtdbId){
      console.log('vengo del movimiento rtdb del state', cs.currentGame.rtdbData.move)
      console.log('movimiento en el state', move)
      console.log('soy el id del rtdb room', longrtdbId)
      return fetch (API_BASE_URL + '/set_move_firestore', {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          move: move,
          longrtdbId:longrtdbId
        })
      })
    } else {
      console.log("id no encontrado")
    }
  },
  //Set move ata State
  setMoveAtState(move:Play){
    const cs = this.getState()
    cs.currentGame.move = move
    this.setState(cs);
    console.log(this.getState())
  },
  //Set move at rtdb
  setMoveAtRtdb(move:Play, longRtdbtID){
    const cs = this.getState()
    if (cs.currentGame.longrtdbId){
      return fetch (API_BASE_URL + '/set_move_rtdb', {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          move: move,
          longRtdbtID: longRtdbtID
        })
      })
    } else {
      console.log("id no encontrado")
    }
  },
  //Save score
  setScore() {
    const currentState = this.getState();

    const player1 = this.getState().currentGame.player1;
    const player2 = this.getState().currentGame.player2;
    const currentWhoWins = this.whoWins(player1, player2);

    const myScore = currentState.history.myScore;
    const computerScore = currentState.history.computerScore;

    if (currentWhoWins === "wins") {
      return this.setState({
        ...currentState,
        history: {
          myScore: myScore + 1,
          computerScore: computerScore,
        },
      });
    } else if (currentWhoWins === "loss") {
      return this.setState({
        ...currentState,
        history: {
          myScore: myScore,
          computerScore: computerScore + 1,
        },
      });
    }
  },
//Determinates who wins
  whoWins(longRtdbtID,) {
    const cs = this.getState()
    if (cs.currentGame.longrtdbId){
      const chatRoomRef = ref(rtdb, 'Rooms/' + cs.currentGame.longrtdbId);
      onValue(chatRoomRef, (snapshot) => {
        const data = snapshot.val();

        cs.currentGame.move.player1 = data.move[0] 
        cs.currentGame.move.player2 = data.move[1]

      })
    }

    const player1 = cs.currentGame.move.player1
    const player2 = cs.currentGame.move.player2

    console.log("Soy el player1 en state", player1, "Soy el player 2", player2)

    const tieS: boolean = player1 == "scissors" && player2 == "scissors";
    const tieR: boolean = player1 == "rock" && player2 == "rock";
    const tieP: boolean = player1 == "paper" && player2 == "paper";
    const tie = [tieP, tieR, tieS].includes(true);

    if (tie) {
      return "tie";
    }

    const winS: boolean = player1 == "scissors" && player2 == "paper";
    const winR: boolean = player1 == "rock" && player2 == "scissors";
    const winP: boolean = player1 == "paper" && player2 == "rock";
    const youWin = [winP, winR, winS].includes(true);

    if (youWin) {
      return "wins";
    }

    const looseS: boolean = player1 == "scissors" && player2 == "rock";
    const looseR: boolean = player1 == "rock" && player2 == "paper";
    const looseP: boolean = player1 == "paper" && player2 == "scissors";
    const youLoose = [looseS, looseR, looseP].includes(true);

    if (youLoose) {
      return "loss";
    }
  },
  //Listen to a Room
  listenToRoom (longRtdbtID) {
    const cs = this.getState();
    if (cs.currentGame.longrtdbId){
      return fetch (API_BASE_URL + '/listen_room', {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          longRtdbtID: longRtdbtID
        })
      })
    } else {
      console.log("id no encontrado")
    }
  }
};

export { state };
