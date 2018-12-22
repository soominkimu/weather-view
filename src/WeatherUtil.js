// WeatherUtil.js
const scaleRange = {  // for heatmap display
  temp : {
    min : 0,
    max : 32,
    w   : 32-0
  },
  humidity : {
    min : 10,
    max : 90,
    w   : 90-10
  }
};

// CCS hsl color code from [0,1] val; based on the 5 color heatmap
const itemPercent = (v, item) => {
  if (v < item.min) return 0;
  if (v > item.max) return 1;
  return Number(((v-item.min)/item.w).toFixed(2));
}

export const tempPercent     = (val) => itemPercent(val, scaleRange.temp);
export const humidityPercent = (val) => itemPercent(val, scaleRange.humidity);

export const perc2Temp = (perc) => Number(((scaleRange.temp.w)*perc).toFixed(1));

// 5 color heatmap
//0    : blue   (hsl(240, 100%, 50%))
//0.25 : cyan   (hsl(180, 100%, 50%))
//0.5  : green  (hsl(120, 100%, 50%))
//0.75 : yellow (hsl(60,  100%, 50%))
//1    : red    (hsl(0,   100%, 50%))
// https://stackoverflow.com/questions/12875486/what-is-the-algorithm-to-create-colors-for-a-heatmap
// hue: red primary at 0°, green at 120°, blue at 240°
export const heatMapColor = (val, op=.7) => {
  let v = val;
  if      (v < 0) v = 0;
  else if (v > 1) v = 1;
  const h = Number(((1.0 - v) * 240).toFixed(2)); // converting to Number erases trailing 0's
  return `hsla(${h},100%,50%,${op})`;
}
