import {Router} from '@vaadin/router';
import { state } from '../../state';



class InstructionsPage extends HTMLElement {
  connectedCallback(){
    this.render();
    this.querySelector(".home-button").addEventListener("click", () => {
      state.changeStartStatus()
      state.waitingForStartChange()
    });
  }
  render(){
    const rock = require("url:../../images/piedra. jpg")
    const sisors = require("url:../../images/tijera. jpg")
    const paper = require("url:../../images/papel. jpg")
    const playButton = require("url:../../images/jugarBoton. jpg")
  
    this.innerHTML = `
      <div class = home-title-container>
        <h2 class = home-title> 
          Tu oponente está listo, ¿empezamos?
        </h2>
      </div>
      <div class = button-container>
        <img class = home-button src="${playButton}">
      </div>
      <div class = img-container>
        <div class = img-mini-container>
          <img class = img src="${rock}">
        </div>
        <div class = img-mini-container>
          <img class = img src="${sisors}">
        </div>
        <div class = img-mini-container>
          <img class = img src="${paper}">
        </div>
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
          font-size: 40px;
        }
        .button-container{
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: 50px;
        }
        .home-button-container{
          width: 100%;
          height: auto;
          display: flex;
          justify-content: center;
          margin-top: 75px;
        }
        .home-button{
          background-color: black;
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
        .img{
          width: 56px;
          height: 100px;
        }
    `
    this.appendChild(style);
  }

}
customElements.define("instruction-page",InstructionsPage )
