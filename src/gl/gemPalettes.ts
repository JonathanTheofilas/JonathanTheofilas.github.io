/**
 * Gemstone colour ramps, dark → light — extracted as data from Studio AAA's
 * free "Dither Boy Gemstones" palette pack (the .json palettes converted to
 * hex). Used by the gem-dither tile painter: an animated field quantized to
 * one of these ramps through a Bayer matrix.
 *
 * A ramp's ORDER is what makes ordered dithering read well — these are
 * hand-built luminance ramps, which is the thing worth keeping over
 * generating our own.
 */

export interface GemRamp {
  name: string;
  colors: string[];
}

export const rampOf = (name: string): string[] =>
  GEM_RAMPS.find((r) => r.name === name)?.colors ?? GEM_RAMPS[0].colors;

export const GEM_RAMPS: GemRamp[] = [
  { name: "Amethyst Cave", colors: ["#090318", "#001d1a", "#00034c", "#291c40", "#3e2957", "#3c3e79", "#504d95", "#675bb1", "#a35eb5", "#c06bcb", "#df79e0", "#c0a0ff", "#dfafff", "#ffbeff", "#ffaaf5"] },
  { name: "Amethyst Shard", colors: ["#170f29", "#2e1a3c", "#4e2951", "#662d56", "#74274b", "#7667be", "#8f61c0", "#a759bb", "#c051ae", "#ffd0ff", "#ffc6ff", "#ffbcff", "#ffb0ff"] },
  { name: "Amethyst", colors: ["#0e0000", "#3a0000", "#5f032f", "#7e346b", "#9560a8", "#a690e2", "#b1c3ff"] },
  { name: "Dirty Gem", colors: ["#000000", "#060400", "#1c1507", "#2f2a36", "#5a3e28", "#ff7a92", "#bf4392", "#ca66e1"] },
  { name: "Emerald Mine", colors: ["#000500", "#4e3200", "#443700", "#383c00", "#2a4000", "#164300", "#004500", "#607300", "#517600", "#3f7900", "#287c00", "#007d23", "#007f36"] },
  { name: "Emerald Shard", colors: ["#000503", "#1a2d0e", "#244112", "#0e8a48", "#5dc3a1", "#9ab181", "#abd67f", "#d0f5e5"] },
  { name: "Emerald", colors: ["#001100", "#003b22", "#1a6841", "#406319", "#69cc99", "#7abf6e", "#87de89", "#7ffcaf"] },
  { name: "Garnet", colors: ["#0c0000", "#1d0000", "#17003b", "#390036", "#005bd7", "#0022ff", "#6b28ff", "#d6baff"] },
  { name: "Gem Cave", colors: ["#0e0000", "#500000", "#db6a97", "#8c7ce3", "#69a238", "#00ceb3", "#8acaff"] },
  { name: "Quartz", colors: ["#1c1620", "#3c2638", "#2e5c46", "#d6386e", "#60c880", "#ffd6e4"] },
  { name: "Rubies", colors: ["#010000", "#0b0100", "#1c0200", "#2d0500", "#380017", "#4d0922", "#601e25", "#ff0000", "#ef9285", "#f2a49f", "#e2baa7"] },
  { name: "Sapphire", colors: ["#000028", "#000036", "#2b4667", "#0029ff", "#5582ff", "#95baff"] },
  { name: "Soul Gem", colors: ["#080000", "#010421", "#300059", "#691562", "#0071c4", "#6b70ff", "#9952ff", "#e19aff"] },
];
