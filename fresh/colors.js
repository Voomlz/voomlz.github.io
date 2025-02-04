// From https://css-tricks.com/converting-color-spaces-in-javascript/
function HSLtoHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  // Prepend 0s, if necessary
  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;

  return "#" + r + g + b;
}

// Inspired by https://stackoverflow.com/a/20129594
function getColor(n) {
  let hue = (n * 137.508) % 360; // Golden angle approximation
  let sat = 100 - ((n * 9) % 51);
  let lig = 55 + ((n * 3) % 26);
  return HSLtoHex(hue, sat, lig);
}

const classColors = {
  Druid: "#ff7d0a",
  Hunter: "#a9d271",
  Mage: "#40c7eb",
  Paladin: "#f58cba",
  Priest: "#ffffff",
  Rogue: "#fff569",
  Shaman: "#0070de",
  Warlock: "#8787ed",
  Warrior: "#c79c6e",
  Pet: "#00ff96",
};
