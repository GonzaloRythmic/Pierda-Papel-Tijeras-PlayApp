import * as express from "express"

import {rtdbAdmin, firestoreAdmin} from "./databaseAdmin";
import { getFirestore, getDoc, addDoc, documentId, FieldPath } from 'firebase/firestore';
import { getDatabase, ref, onValue, set } from "firebase/database";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import * as cors from "cors";
import { v4 as uuidv4 } from 'uuid';






const app = express(); 
app.use(cors());
app.use(express.json());

app.use(express.static("dist"))

const port = process.env.PORT || 3001;

//Collections refs
const userCollectionRef = firestoreAdmin.collection("Users");
const roomsCollectionRef = firestoreAdmin.collection("Rooms");



//Create a new user at Firestore
app.post("/signup", (req, res) => { 
  const {userName} = req.body;
  const {userEmail} = req.body
  userCollectionRef.add({ 
    owner: true, 
    userName: userName,
    userEmail: userEmail 
  }).then((newUserRef) => {
    res.status(200).json({
      userName: userName,
      userId: newUserRef.id,
      owner: true,
    });
  })
});

//Authenticate user. If exists returns id
app.post("/auth", (req, res) => {
  const { userEmail } = req.body;
  userCollectionRef.where("userEmail", "==", userEmail).get().then((searchResponse) => {
    if (searchResponse.empty) {
      res.status(404).json({
        message:
        "usuario no registrado.",
      });
    } else {
      res.status(200).json({
        id: searchResponse.docs[0].id,
      });
    }
  });
});
    
// Create a room at Real Time Data Base if the user exists
app.post("/room", (req, res) => {
  const { userId } = req.body;
  userCollectionRef.doc(userId).get().then((doc) => {
    if (doc.exists) {
      //Create room at RealTimeDataBase
      const newRoomRef = rtdbAdmin.ref("Rooms/" + uuidv4());
      const longRoomId = newRoomRef.key;
      const shortRoomId = 1000 + Math.floor(Math.random() * 999);
      newRoomRef.set({
        owner: userId,
        shortRoomId : shortRoomId,
        longRoomId : longRoomId,
        onlineOwner: false,
        onlineGuest: false,
        start: false,
        move:'' 
        }).then(() =>{
          return res.json({
          shortRoomId: shortRoomId,
          longRoomId: longRoomId 
        })
      }).then((response)=>{});
    } else {
      res.status(401).json({
        message: "El id no existe.",
      });
    }
  });
});

// Create room at Firestore amd return new room ID
app.post ("/create_room_firestore", (req, res)=>{
  const {shortRtdbId} = req.body;
  const {longRtdbId} = req.body
  const newRoomCollectionRef = roomsCollectionRef.add({
    shortRtdbId: shortRtdbId.toString(),
    longRtdbId: longRtdbId.toString(),
    move:{}
  }).then((newRoomRef) => {
    console.log('id del nuevo room', newRoomRef.id)
    res.status(200).json({
     newRoomID: newRoomRef.id
    });
    
  }) 
});

//Look for Firestore Room by longrtdbId
app.post("/look_for_roomfirestore", (req, res)=>{
  const { longRtdbId } = req.body;
  roomsCollectionRef.where("longRtdbId", "==", longRtdbId).get().then((searchResponse)=>{
    if (searchResponse.empty) {
      res.status(404).json({
        message:
        "room no encontrado.",
      });
    } else {
      console.log(searchResponse.data)
      res.status(200).json({
        id: searchResponse.docs[0].id,
      });
    }
  });
  })

//Verify shortID and return longID
app.post("/auth_room", (req, res) => {
  const { shortRtdbId } = req.body;
  roomsCollectionRef.where("shortRtdbId", "==", shortRtdbId.toString()).get().then((searchResponse) => {
    if (!searchResponse.empty) {
      res.json({
        roomLongId: searchResponse.docs[0].get("longRtdbId"),
      });
    } else {
      res.status(404).json({
        message: "no existe un room con ese id",
      });
    }
  });
});

//Change onlineGuest flag.
app.post("/change_status",  (req, res) => {
  const {longRtdbtID} = req.body;
  const chatRoomRef = rtdbAdmin.ref("/Rooms/"+longRtdbtID)
  //actualiza el dato.
  chatRoomRef.update({
    onlineGuest: true
  })
  res.json('Todo okey') //devuelvo solo un mensaje
});
//Change "start" flag
app.post('/change_start_status', (req, res)=>{
  const {longRtdbtID} = req.body;
  const chatRoomRef = rtdbAdmin.ref("/Rooms/"+longRtdbtID)
  //actualiza el dato.
  chatRoomRef.update({
    start: true
  })
  res.json('Todo okey') //devuelvo solo un mensaje
});
//Set move at Firestore
app.post('/set_move_firestore', (req, res) => {
  const {longrtdbId} = req.body;
  const {move} = req.body;
  roomsCollectionRef.where("longRtdbId", "==", longrtdbId).get().then((querySnapshot)=>{
    if (querySnapshot.empty) {
      res.status(404).json({
        message:
        "usuario no registrado.",
      });
    } else {
      const roomFirestoreID = querySnapshot.docs[0].id
      roomsCollectionRef.doc(roomFirestoreID).update({
        move:move
      })
      res.status(200).json({
        id: querySnapshot.docs[0].id,
      });
    }
  })
});
//Set move at Real Time DataBase
app.post('/set_move_rtdb', (req, res)=>{
  const {longRtdbtID} = req.body;
  const {move} = req.body; 
  const chatRoomRef = rtdbAdmin.ref("/Rooms/"+longRtdbtID+"/move")
  console.log('Vengo del server', move)
  console.log('Vengo del server', longRtdbtID)
  chatRoomRef.push().set(move)
  res.json('Todo okey')
})
//Listen to a room at Real Time Data Base.
app.post('/listen_room', (req, res)=> {
  
  const {longRtdbtID} = req.body;
  const chatRoomRef = rtdbAdmin.ref("/Rooms/"+longRtdbtID)
  chatRoomRef.on('value', (snapshot) => {
    console.log("Esto es lo que hay en rtdb", snapshot.val());
    
    return res.json({
      message: 'Datos de la rtdb',
      data: snapshot.val()
    })
  }, (errorObject) => {
    console.log('The read failed: ' + errorObject.name);
    
  }); 
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

