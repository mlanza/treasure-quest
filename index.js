import _ from "./lib/@atomic/core.js";
import dom from "./lib/@atomic/dom.js";
import t from "./lib/@atomic/transducers.js";
import $ from "./lib/@atomic/reactives.js";
import * as cmd from "./lib/cmd.js";
import * as q from "./lib/treasure-quest.js";

const level = parseInt(new URLSearchParams(location.search).get("level") || 0);
const nextLevel = level + 1;
const $state = $.cell(q.init(level));
const $hist = $.hist($state);
const el = dom.sel1("#treasure-quest");
const room = dom.sel1("#room", el);
const span = dom.tag('span');

dom.text(dom.sel1("#level span", el), level);
dom.attr(dom.sel1("#next-level", el), "href", `?level=${nextLevel}`)
dom.text(dom.sel1("#next-level span", el), nextLevel);

const $keys = $.chan(document, "keydown");
const $move = $.pipe($keys, _.comp(t.map(function(e){
  return e.key;
}), t.filter(_.startsWith(_, "Arrow")), t.map(_.lowerCase), t.map(_.replace(_, "arrow", ""))));
$.sub($move, function(move){
  _.swap($state, q.move(_, move));
});
$.sub($state, _.log);
$.sub($hist, function([curr, prior]){
  if (prior) {
    _.eachkv(function(what, positions){
      _.eachIndexed(function(idx, [x, y]){
        const [px, py] = _.getIn(prior, [what, idx]);
        if (x !== px || y !== py) {
          const o = dom.sel1(`[data-x='${px}'][data-y='${py}']`, room);
          dom.attr(o, "data-x", x);
          dom.attr(o, "data-y", y);
        }
      }, positions);
    }, curr)
  } else {
    dom.html(room, _.mapkv(function(piece, vals){
      const icon = q.icon(piece);
      return _.mapa(function([x, y]){
        return span({"data-piece": piece, "data-x": x, "data-y": y}, icon);
      }, vals);
    }, curr));
  }
});
