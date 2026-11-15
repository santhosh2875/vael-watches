# VAEL · Caldera

A scroll site for one watch: the Caldera, with a case like cooled lava and a dial fired eleven times. Scrolling moves the camera around the watch, stopping at the case and the dial, and ends on a choice of four dials.

"Vael" is a demo brand. The prices, measurements, phone and email are invented.

Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Run it
```bash
python -m http.server 5183
```
Then open http://localhost:5183.

## Edit it
Everything you are likely to change is in `config.js`: the brand, the camera stops and their words, the dials and prices, the making steps and the specs.

## Media
- `assets/stills/`: the pictures for each camera stop, each dial and the making steps. The page works with these alone, fading from one view to the next.
- `assets/film/`: a frame sequence listed in `manifest.json`. When it exists the page plays it instead, so scrolling moves the camera.
- `assets/clips/`: the source clips the frames were cut from.

## Files
```
index.html      all sections
styles.css      all styles
config.js       all the content
app.js          the scroll film, dial picker and sections
```
