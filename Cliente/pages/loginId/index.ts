import {Router} from '@vaadin/router';
import { startAfter } from 'firebase/database';
import { state } from '../../state';


class LoginId extends HTMLElement {
  shadow = this.attachShadow({mode: "open"})
  listeners(){
    this.shadow.querySelector(".sala").addEventListener("click", (e) => {
      e.preventDefault;
      const inputIdEl = this.shadow.getElementById("inputid") as any
      const gamer_1_nameEl = this.shadow.getElementById("input-name") as any; 
      const emailEl = this.shadow.getElementById("input-email") as any;
      

      //inputs
      const inputIDValue = inputIdEl.value
      const userName = gamer_1_nameEl.value
      const userEmail = emailEl.value



      if (userName === "" && userEmail === "") {
        alert("Debes ingresar un nombre y un email.");
        Router.go("/loginId");
      } else {
        const cs = state.getState()
        //Set name and email at State
        state.setEmailAndName(userEmail, userName);
        cs.currentGame.rtdbId = inputIDValue
        
        // Create user at Firestore
        state.createUserAtFirestore().then((res)=>{
          return res.json();
        }).then(()=>{
          //Authenticate user return userID
          state.authentication().then((res) => {
            return res.json();
          }).then((data) => {
            cs.currentGame.firestoreId = data.id;
            //Authenticate room return longRtdbId
            state.authenticateRoom(inputIDValue.toString()).then((res)=>{
              return res.json()
            }).then((data)=>{
              if (data.message == 'no existe un room con ese id') {
                alert("Debes ingresar un RoomID");
              } else {
                cs.currentGame.longrtdbId = data.roomLongId
                state.setState(cs);
                Router.go("/waiting-room")                              
              }
            })
          });;
        })
      }
    })
  }
  connectedCallback(){
    this.render();
    this.listeners()
  }
  render(){
    const rock = require("url:../../images/piedra. jpg")
    const sisors = require("url:../../images/tijera. jpg")
    const paper = require("url:../../images/papel. jpg")
    const button = require("url:../../images/boton. jpg")
    const sala = require("url:../../images/botón (5).png")
    
    this.shadow.innerHTML = `

    <div class = home-title-container>
      <h2 class = home-title>Por favor ingresa tu nombre</h2>
    </div>
    <div class = home-button-container>
      <input class="input" type="text" id="input-name">
    </div>

    <div class = home-title-container>
      <h2 class = home-title>Por favor ingresa tu email</h2>
    </div>
    <div class = home-button-container>
      <input class="input" type="text" id="input-email">
    </div>

    
    <div class = home-title-container>
        <h2 class = home-title>Por favor ingresa un ID</h2>
    </div>
    <div class = home-button-container>
        <input class="input" id="inputid" type="text">
    </div>
    <div class="sala-container" >
        <img class = "sala" id='sala'src="${sala}">
    </div>
    `;
  
    
    const style = document.createElement("style");
    style.innerHTML =`
      .home-title-container{
        width: 100%;
        height: auto;
        text-align: center;
        display: flex;
        justify-content: center;
      }
      .home-title{
        font-family: "Permanent Marker";
        font-size: 80px;
      }
      .home-button-container{
        width: 100%;
        height: auto;
        display: flex;
        justify-content: center;
        margin-top: 75px;
        text-align: center; 
      }
      .home-button{
        background-color: black;
      }
      .img-containter-container{
        width: 100%;
        display: flex;
        justify-content: center;
      }
      .img-container{
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        column-gap: 50px;
        position: absolute; bottom: 0;
      }
      .img-mini-container{
        display: flex;
        justify-content: center;
      }
      @media (min-width: 600px){
        .img-container{
          width: 322px;
          height: 180px
        }
      }
      .img{
        width: 56px;
        height: 128px;
      }
      @media (min-width: 600px){
        .img{
          width: 45px;
          height: 100px
        }
      }
      .sala-container{
        display:flex;
        justify-content:center;
        margin-top:25px;
      }
      .input{
          width: 322px;
          height: 87px;
          border-solid: black;
          border-radius: 30px;
      }
    `
    this.shadow.appendChild(style);
    // this.shadow.querySelector('.sala').addEventListener("click", ()=>{
    //   console.log('hola')
    // })
  };
}
customElements.define("loginid-page", LoginId);