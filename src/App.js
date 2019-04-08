// weather-view
import React from 'react';
import './App.css';
import {
  IsLeapYear
} from './CalUtil';
import {
  tempPercent,
  //humidityPercent,
  perc2Temp,
  heatMapColor
} from './WeatherUtil';

//import weatherData from './dataJSON/M_tokyo-Avg.json';

const drawLine = (ctx, x, y, x2, y2) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// drawing grid with rect():   O(n^2)
//              with lineTo(): O(2n)
const drawGrid = (ctx, x, y, gw, gh, W, H) => {
  const x2 = x + W;
  const y2 = y + H;
  for (let xv=x; xv <= x2; xv += gw) { // vertical lines
    drawLine(ctx, xv, y, xv, y2);
  }
  for (let yv=y; yv <= y2; yv += gh) {  // horizontal lines
    drawLine(ctx, x, yv, x2, yv);
  }
}

const gridVerticalYear = (ctx, x, y, gh, W) => {
  const H = gh*366;
  ctx.beginPath();
  ctx.strokeRect(x, y, W, H);
  const x2   = x + W;
  const days = [31, 29, 31, 30, 31, 30,
                31, 31, 30, 31, 30, 31];
  let y2=y;
  days.forEach(n => {
    y2 += n*gh;
    drawLine(ctx, x, y2, x2, y2);
  });
}

const Legend = ({bCelsius, itemName}) => {
  const sz      = {x: 10, y: 10};   // size of the unit rectangle
  const margin  = {x: 5,  y: 5};
  const headLen = 26;    // height of the title header space
  const num     = 16+1;  // number of scales: (max - min) divisors, 2^n+1
  const divisor = (num-1)/4;
  let lnsStop   = [];
  //let lnsRect   = [];
  let lnsText   = [];
  const svgSz   = {
    x: margin.x*2 + sz.x + 20,
    y: margin.y*2 + headLen + sz.y*num
  };
  
  for (let i=0; i < num; i++) {
    let perc = 1 - i/(num-1);
    lnsStop.push(<stop key={i} offset={(1-perc)*100 + '%'} stopColor={heatMapColor(perc)} />);

    if (i % divisor === 0) {
      lnsText.push(
        <text
          key={i}
          x={margin.x + sz.x + 1}
          y={margin.y + headLen + i*sz.y + Math.floor(sz.y/1.5)}
        >{bCelsius ? (perc2Temp(perc) + '°C') : (Math.floor(perc*100) + '%')}</text>
      );
    }
  }
  
  return (
    <div>
      <svg width ={svgSz.x} height={svgSz.y}
        style ={{border: "1px solid Beige", backgroundColor: "Ivory"}}
      >
        <text x={svgSz.x/2} y={12} fontSize=".8em" textAnchor="middle">
          {itemName[0]}
          <tspan x={svgSz.x/2} y={10+14} fill="DarkRed">{itemName[1]}</tspan>
        </text>
        <defs>
          <linearGradient id="GradLegend01" x1="0%" y1="0%" x2="0%" y2="100%">
            {lnsStop}
          </linearGradient>
        </defs>
        <rect x={margin.x} y={margin.y + headLen} width={sz.x} height={sz.y*num} fill="url(#GradLegend01)" />
        <g fontFamily="Verdana" fontSize=".5em" textAnchor="left">
          {lnsText}
        </g>
      </svg>
    </div>
  );
}

const fetchJSON = (url, callback) => {
  fetch(url)
    .then(response => {
       const contentType = response.headers.get("content-type");
       console.log('contentType:', contentType);
       if (contentType && contentType.includes("application/json"))
         return response.json();
       throw new TypeError("Opps, no JSON file!");
    })  // parses response to JSON
    .then(data => callback(data))
    .catch(error => console.log(error));
}

class CanvasCompo extends React.Component {
  constructor(props) {
    super(props);
    this.w = 4;
    this.h = 2;
    this.updateCanvas = this.updateCanvas.bind(this);  // callback from fetch
  }

  componentDidMount() {
    // ~/D/nodejs/fileserver$ node server.js
    //fetchJSON('http://localhost:9001/dataJSON/M_tokyo-Avg.json', this.updateCanvas);
    fetchJSON('https://soominkimu.github.io/data/M_tokyo-Avg.json', this.updateCanvas);
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas(wData) {
    const ctx = this.refs.canvas.getContext('2d');
    const m = {x: 10, y: 30};
    const w = this.w;
    const h = this.h;
    const yrFr = Number(wData.meta.from.substring(0,4));
    const yrTo = Number(wData.meta.to.substring(0,4));
    const yrTotal = yrTo - yrFr + 1;
    console.log(yrFr, yrTo, yrTotal, "years of data");
    let bLeap = IsLeapYear(yrFr);
    let y=0;  // year count
    let d=0;  // day (data) count, 0 at the first day of each year
    let p = {x: m.x, y: m.y};  // to save calculations
    console.log(yrFr, wData.data.length, 'lines of data');

    const lh = 20;  // legend height
    let grd = ctx.createLinearGradient(m.x, m.y, w*(yrTotal+1), 0);
    const pct_max = 1.2;
    const pct_min = -.2;
    const pct_w   = pct_max - pct_min;
    const dpct    = pct_w/30;
    for (let pct=pct_min; pct <= pct_max; pct += dpct)
      grd.addColorStop((pct-pct_min)/pct_w, heatMapColor(pct, 1));
    // ctx.filter = 'blur(4px)';
    //ctx.filter = 'drop-shadow(4px 4px 2px lightgray)';
    ctx.save();  // because we are using very expensive process (shadow)
    ctx.shadowColor = 'LightGray';
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 4;
    ctx.fillStyle = grd;
    ctx.fillRect(m.x, m.y-lh-6, w*yrTotal, lh);
    ctx.restore();
    /*
    let gd = ctx.createLinearGradient(m.x, m.y, m.x, m.y+h*366);
    weather.data.forEach(data => {
      if (data !== null) {
        gd.addColorStop(d/366, heatMapColor(tempPercent(data), 1));  // hsla
      }
      if (d >= 365) {
        ctx.fillStyle = gd;
        ctx.fillRect(p.x, m.y, w, h*366);
        y++;
        p.x += w;
        bLeap = IsLeapYear(yrFr + y);
        d = 0;
        p.y = m.y;  // carriage return
        gd = ctx.createLinearGradient(m.x, m.y, m.x, m.y+h*366);
      } else {
        d++;
        p.y += h;
        if (!bLeap && (d === (31+28))) {
          ctx.fillStyle = "Gray";      // Delete this line to fill with the same color as Feb.28's data
          ctx.fillRect(p.x, p.y, w, h);
          d++;  // skip to make up 1 day of Feb.29 for the non-leap year
          p.y += h;
        }
      }
    }
    ctx.fillStyle = gd;
    ctx.fillRect(p.x, m.y, w, h*366);
    */
    wData.data.forEach(data => {
      if (data !== null) {
        ctx.fillStyle = heatMapColor(tempPercent(data), 1);  // hsla
        ctx.fillRect(p.x, p.y, w, h);
      }
      if (d >= 365) {
        y++;
        p.x += w;
        bLeap = IsLeapYear(yrFr + y);
        d = 0;
        p.y = m.y;  // carriage return
      } else {
        d++;
        p.y += h;
        if (!bLeap && (d === (31+28))) {
          ctx.fillStyle = "Gray";      // Delete this line to fill with the same color as Feb.28's data
          ctx.fillRect(p.x, p.y, w, h);
          d++;  // skip to make up 1 day of Feb.29 for the non-leap year
          p.y += h;
        }
      }
    });
    ctx.lineWidth = .5;
    ctx.strokeStyle = "rgba(0,0,0, .5)";
    drawGrid(ctx, m.x, m.y, w, h, w*(y+1), h*366);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0, 1)";
    gridVerticalYear(ctx, m.x, m.y, h, w*(y+1));
  }

  render() {
    return (
      <canvas ref="canvas" width={40+this.w*144} height={40+this.h*366*3} />
    );
  }
}

class App extends React.Component {

  render() {
    return (
      <div className="App">
        <h3 className="title">Average Temperature of Tokyo 1876~2019 (東京の平均気温、143年間)</h3>
        <div className="content">
          <CanvasCompo />
          <Legend bCelsius={true} itemName={["平均","気温"]}/>
        </div>
      </div>
    );
  }
}

export default App;
