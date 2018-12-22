// weather-view
import React from 'react';
import './App.css';

class CanvasCompo extends React.Component {
  componentDidMount() {
    this.updateCanvas();
  }
  updateCanvas() {
    const ctx = this.refs.canvas.getContext('2d');
    const w = 2;
    for (let y=0; y<200; y++) {
      for (let d=0; d<365; d++) {
        ctx.fillStyle = `hsla(${Math.floor(240*Math.random())},100%,50%,1)`;
        ctx.fillRect(10+w*d,10+w*y, w,w);
      }
    }
    let grd = ctx.createLinearGradient(10,0,w*365,0);
    grd.addColorStop(0,   "blue");
    grd.addColorStop(.25, "cyan");
    grd.addColorStop(.5,  "green");
    grd.addColorStop(.75, "yellow");
    grd.addColorStop(1,   "red");
    // ctx.filter = 'blur(4px)';
    ctx.filter = 'drop-shadow(4px 4px 2px lightgray)';
    ctx.fillStyle = grd;
    ctx.fillRect(10,10+w*201,w*365,40);
  }
  render() {
    return (
      <canvas ref="canvas" width={1200} height={2000} />
    );
  }
}

class App extends React.Component {

  render() {
    return (
      <div className="App">
        <CanvasCompo />
      </div>
    );
  }
}

export default App;
