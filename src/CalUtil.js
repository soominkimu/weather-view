// CalUtil
//
import Names from './names.json';

// Check if the given year is a leap year in the Gregorian calendar
export const IsLeapYear = (y =>
  ((y % 4   === 0) &&
   (y % 100 !== 0)) ||
   (y % 400 === 0));

// const DaysInMonth = (m, y) => new Date(y, m, 0).getDate();
// m: 1..12
// Gregorian Calendar: Sep. 1752 -> 1,2,14,...30 (11 days advanced)
export const DaysInMonth = (m, y) => {
  switch (m) {
    case 4:
    case 6:
    case 9:
    case 11: return 30;
    case 2:  return IsLeapYear(y) ? 29 : 28;
    default: return 31;
  }
}

// Count the number of days with the year up to the specified date
// m starts from 1
export const NthDayInYear = (yr, m, d) => {
/*
  let mo = 1;
  let days = 0;
  while (mo < m) {
    days += DaysInMonth(mo, yr);  // add up days to the previous month
    mo++;
  }
*/
  // For the optimized performance, avoid the loop and use the pre-calculated array
  // accumulated days until the month
  const accDays = [
    0,
    31,
    31+28,
    31+28+31,
    31+28+31+30,
    31+28+31+30+31,
    31+28+31+30+31+30,
    31+28+31+30+31+30+31,
    31+28+31+30+31+30+31+31,
    31+28+31+30+31+30+31+31+30,
    31+28+31+30+31+30+31+31+30+31,
    31+28+31+30+31+30+31+31+30+31+30
  // 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11 month
  ];
  if (m < 1 || m > 12)
    return 0;  // valid range check
  let days = accDays[m-1];
  if (m > 2 && IsLeapYear(yr))
    days++;
  return (days + d);
}

// 元号 from 西暦
export const GengoYear = (yr) => {
  for (let i = (Names.Gengo.yr.length - 1); i >= 0; i--)
    if (yr >= Names.Gengo.yr[i])
      return Names.Gengo.jp[i] + (yr - Names.Gengo.yr[i] + 1);
  return yr;   // out of range, just return yr
}

export const deg2rad = (deg) => deg*Math.PI/180;

// get Julian Day Number
// Invented in 1583 by Joseph Scaliger
// The 7980 year cycle (solar, lunar, and a particular Roman tax cycle)
// Jan.1,4713 B.C. at noon GMT ~ Jan.22,3268 at noon GMT
// The number of days from Jan. 1, 4713 B.C. at 12:00:00 GMT, until Jan. 1, 1970 at 00:00:00 UTC
// A day is 86,400 seconds long. UNIX TIM / 86400000 is the number of days since Jan. 1, 1970
// new Date gives you the number of seconds from epoch until whatever loca ltime your computer has
export const getJulianDay = (date) => (date.getTime() / 86400000.0 + 2440587.5);

// SOURCE: https://news.local-group.jp/moonage/moonage.js.txt
export const getMoonAge = (date) => {
  // 新月日計算
  // 引数  　julian  ユリウス通日
  // 戻り値  与えられたユリウス通日に対する直前の新月日(ユリウス日)
  const getNewMoon = (j) => {
    const n1 = 2451550.09765;
    const n2 = 29.530589;
    const n3 = 0.017453292519943;
    const k  = Math.floor((j - n1) / n2);
    const t  = k / 1236.85;

    return (
        n1
      + n2 * k
      + 0.0001337 * t * t
      - 0.40720   * Math.sin((201.5643 + 385.8169 * k) * n3)
      + 0.17241   * Math.sin((2.5534   +  29.1054 * k) * n3)
    );
  }
  
  const jd = getJulianDay(date);
  // console.log('Julian: ', jl);
  let nm = getNewMoon(jd);
  // getNewMoonは新月直前の日を与えるとうまく計算できないのでその対処
  // (一日前の日付で再計算してみる)
  if (nm > jd) {
    nm = getNewMoon(jd - 1.0);
  }
  // console.log('Moon age:', jd - nm);
  return (jd - nm);  // moon's age at current time
}

// 360 degree
export const NormalizeDegree = (deg) => {
  if (deg >= 0 && deg < 360)  // Don't allow 360, it should be rewinded to 0.
    return deg;
  let nd = deg % 360;
  if (nd < 0)
    nd += 360;
  return nd;
}

// Position of the Sun: https://en.wikipedia.org/wiki/Position_of_the_Sun
// Precision: compared to 国立天文台＞暦計算室＞暦象年表
// 1.26 ~ 15.41 min (0.0106 degree) for 2019年二十四節気 視黄経 (Tested at Dec.6,2018)
export const getPosSun = (date) => {
  const n = getJulianDay(date) - 2451545.0;
  // The mean longitude of the Sun, corrected for the aberration of light
  const L = NormalizeDegree(280.460 + 0.9856474*n);  // in degree
  // The mean anomaly of the Sun
  const g = deg2rad(357.528 + 0.9856003*n);  // in radian
  // The ecliptic longitude of the Sun
  return {
    longitude: NormalizeDegree(L + 1.915*Math.sin(g) + 0.020*Math.sin(2*g)),
    distance: 1.00014 - 0.01671*Math.cos(g) - 0.00014*Math.cos(2*g)
  };
}

// Test Modules
//
export const TestCalUtil = () => {
  console.log("***********************")
  const date = [
    new Date(1933,6-1,25,12,0,0),  // GMT+9 -> JST 12:00:00
    new Date(1967,1-1, 9,12,0,0),
    new Date(1972,6-1,10,12),
    new Date(2004,5-1,13,12),
    new Date()
  ];
  date.map(d => console.log(d.toDateString(), Number(getMoonAge(d).toFixed(3))));
  console.log(NthDayInYear(2018,12,4));
  console.log("getTimezoneOffset:", date[4].getTimezoneOffset(), "min");
  // http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_s.cgi
  const d24 = [  // 二十四節気
    new Date(2019, 1-1, 6, 0,39),
    new Date(2019, 1-1,20,18, 0),
    new Date(2019, 2-1, 4,12,14),
    new Date(2019, 2-1,19, 8, 4),
    new Date(2019, 3-1, 6, 6,10),
    new Date(2019, 3-1,21, 6,58),
    new Date(2019, 4-1, 5,10,51),
    new Date(2019, 4-1,20,17,55),
    new Date(2019, 5-1, 6, 4, 3),
    new Date(2019, 5-1,21,16,59),
    new Date(2019, 6-1, 6, 8, 6),
    new Date(2019, 6-1,22, 0,54),
    new Date(2019, 7-1, 7,18,21),
    new Date(2019, 7-1,23,11,50),
    new Date(2019, 8-1, 8, 4,13),
    new Date(2019, 8-1,23,19, 2),
    new Date(2019, 9-1, 8, 7,17),
    new Date(2019, 9-1,23,16,50),
    new Date(2019,10-1, 8,23, 6),
    new Date(2019,10-1,24, 2,20),
    new Date(2019,11-1, 8, 2,24),
    new Date(2019,11-1,22,23,59),
    new Date(2019,12-1, 7,19,18),
    new Date(2019,12-1,22,13,19),
    new Date(2020, 1-1, 6, 6,31),
    new Date(2020, 1-1,20,23,56),
  ];
  let diffMin = 360;
  let diffMax = 0;
  const deg2min = (deg) => Number((deg*24*60*365/360).toFixed(2));
  d24.map((d, i) => {
    const s = getPosSun(d);
    const diff = NormalizeDegree(285 + i*15) - ((s.longitude > 350) ? 360 - s.longitude : s.longitude);
    diffMin = Math.min(diffMin, Math.abs(diff));
    diffMax = Math.max(diffMax, Math.abs(diff));
    return console.log(d.toDateString(),
      "longitude:", Number(s.longitude.toFixed(4)),
      "AU:",        Number(s.distance.toFixed(4)),
      "error:",     Number(diff.toFixed(4)), "|", deg2min(diff), "min"
    );
  });
  console.log("Precision(minutes):", deg2min(diffMin), "~", deg2min(diffMax));
}
