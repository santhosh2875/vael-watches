// Everything you are likely to change lives in this one file.
//
// DEMO CONTENT: the brand, prices, measurements, phone and email below are
// invented. Replace them before using this for a real business.
//
// Pictures (JPG, PNG or WebP) go in assets/stills:
//   01-front      the watch from the front              (top of the page)
//   02-angle      the same watch from a three-quarter angle
//   03-macro      a close-up of the dial
//   04-stand-<id> the watch on its stone stand, one per dial colour below
//   08-made-cast, 09-made-fire, 10-made-test   three close-ups of it being made
//
// The page works with those stills alone: it fades from one view to the next
// as you scroll. When assets/film holds a frame sequence (made from your
// clips), the page plays that instead, so scrolling moves the camera.
window.WATCH = {
  brand: "VAEL",
  model: "Caldera",
  line: "42 mm automatic, made in small batches",
  email: "atelier@example.com",
  phone: "+91 00000 00000",

  // The camera stops, in scroll order. "still" is the picture for that stop.
  // "at" is how far through the film the camera is at that stop (0 = first
  // frame, 1 = last), and "place" is where its words sit: "start" (bottom
  // left), "left" or "right".
  stops: [
    {
      still: "01-front",
      at: 0,
      place: "start",
      nav: "Watch",
      kicker: "Caldera, 42 mm automatic",
      title: "Time, cut from lava.",
      text: "A watch built like an erupting volcano: a crater for a case, and a dial that still looks molten.",
    },
    {
      still: "02-angle",
      at: 0.28,
      place: "right",
      nav: "Case",
      kicker: "The case",
      title: "A crater for a case.",
      text: "The rim is carved like the mouth of a volcano and broken open by hand. Orange enamel is laid into every crack, so it reads as lava running down the sides.",
    },
    {
      still: "03-macro",
      at: 0.6,
      place: "start",
      nav: "Dial",
      kicker: "The dial",
      title: "Fired eleven times.",
      text: "Each layer of enamel is fired on its own, from white-hot at the centre to black crust at the edge. No two dials cool the same way.",
    },
    {
      // The last stop shows whichever dial is chosen below.
      still: "04-stand",
      at: 1,
      nav: "Dials",
      kicker: "The collection",
    },
  ],

  dials: [
    { id: "magma", name: "Magma", colour: "#ff5a1f", note: "Molten orange", text: "The first Caldera. Bright orange at the centre, darkening to red at the edge.", price: 240000 },
    { id: "ember", name: "Ember", colour: "#c2261a", note: "Deep red", text: "A darker dial, like coals an hour after the fire. It reads almost black indoors.", price: 240000 },
    { id: "ash", name: "Ash", colour: "#b9b4ab", note: "Pale grey", text: "Grey enamel over the same cracked base. The quietest of the four.", price: 225000 },
    { id: "cobalt", name: "Cobalt", colour: "#2f6fe0", note: "Blue flame", text: "The hottest part of a flame is blue. Twenty pieces a year.", price: 265000 },
  ],

  made: [
    { still: "08-made-cast", title: "Carve", text: "The crater rim is cut from a ceramic blank, then cracked open and filled with enamel by hand." },
    { still: "09-made-fire", title: "Fire", text: "The dial goes into the kiln eleven times, one layer of enamel each time." },
    { still: "10-made-test", title: "Test", text: "Every watch runs for seven days on a winder before it is allowed to leave." },
  ],

  specs: [
    { value: "42 mm", label: "across the case" },
    { value: "148 g", label: "on the wrist" },
    { value: "72 h", label: "power reserve" },
    { value: "200 m", label: "water resistance" },
  ],
};
