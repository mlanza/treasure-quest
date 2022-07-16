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
dom.attr(dom.sel1("#next-level", el), "href", `?level=${nextLevel}`);
dom.text(dom.sel1("#next-level span", el), nextLevel);

const $keys = $.chan(document, "keydown");
const $move = $.pipe($keys, _.comp(t.map(function(e){
  return e.key;
}), t.filter(_.startsWith(_, "Arrow")), t.map(_.lowerCase), t.map(_.replace(_, "arrow", ""))));
$.sub($move, function(move){
  if (q.solved(_.deref($state))) {
    setTimeout(function(){
      dom.addClass(el, "leaving");
      setTimeout(function(){
        location.href = `/?level=${nextLevel}`;
      }, 1000);
    }, 300);
  }
  _.swap($state, q.move(_, move));
  _.swap($state, q.removeTreasure);
});
$.sub($state, _.log);
$.sub($state, _.comp(t.map(q.solved), t.filter(_.identity)), function(what){
  dom.addClass(el, q.exists(nextLevel) ? "solved" : "conquered");
});
$.sub($hist, function([curr, prior]){
  if (prior) {
    _.eachkv(function(what, positions){
      _.eachIndexed(function(idx, coords){
        const where = _.getIn(prior, [what, idx]);
        if (where) {
          const [px, py] = where;
          const o = dom.sel1(`[data-piece='${what}'][data-x='${px}'][data-y='${py}']`, room);
          if (coords) {
            const [x, y] = coords;
            if (x !== px || y !== py) {
              dom.attr(o, "data-x", x);
              dom.attr(o, "data-y", y);
            }
          } else {
            setTimeout(function(){
              dom.addClass(o, "removed");
              setTimeout(function(){
                dom.omit(o);
              }, 250);
            }, 250);
          }
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

setTimeout(function(){
  dom.removeClass(dom.sel1("#room"), "hidden");
}, 250);
