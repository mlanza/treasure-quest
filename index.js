import _ from "./libs/atomic_/core.js";
import $ from "./libs/atomic_/shell.js";
import dom from "./libs/atomic_/dom.js";
import {reg} from "./libs/cmd.js";
import * as q from "./libs/treasure-quest.js";  //the functional core and...

//the imperative shell!

const level = parseInt(new URLSearchParams(location.search).get("level") || 0);
const nextLevel = level + 1;
const $state = $.cell(q.init(level));
const $hist = $.hist($state);
const el = dom.sel1("#treasure-quest");
const room = dom.sel1("#room", el);
const span = dom.tag('span');
const icon = q.icon(level);

dom.text(dom.sel1("#desc", el), q.desc(level));
dom.text(dom.sel1("#level span", el), level);
dom.attr(dom.sel1("#next-level", el), "href", `?level=${nextLevel}`);
dom.text(dom.sel1("#next-level span", el), nextLevel);

const $keys = $.chan(document, "keydown");
const $move = $.pipe($keys, _.comp(_.map(function(e){
  return e.key;
}), _.filter(_.startsWith(_, "Arrow")), _.map(_.lowerCase), _.map(_.replace(_, "arrow", ""))));

reg({q, $state, $hist, $keys, $move});

$.sub($move, function(move){
  if (q.solved(_.deref($state)) && q.exists(nextLevel)) {
    setTimeout(function(){
      dom.addClass(el, "leaving");
      setTimeout(function(){
        location.href = `${location.origin}${location.pathname}/?level=${nextLevel}`;
      }, 1000);
    }, 300);
  }
  $.swap($state, q.move(_, move));
  $.swap($state, q.removeTreasure);
});

$.sub($state, _.comp(_.map(q.solved), _.filter(_.identity)), function(what){
  dom.addClass(el, "solved");
  q.exists(nextLevel) || dom.addClass(el, "conquered");
});

$.sub($hist, function([curr, prior]){
  if (prior) {
    $.eachkv(function(what, positions){
      $.eachIndexed(function(idx, coords){
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
      return _.mapa(function([x, y]){
        return span({"data-piece": piece, "data-x": x, "data-y": y}, icon(piece));
      }, vals);
    }, curr));
  }
});

setTimeout(function(){
  dom.removeClass(dom.sel1("#room"), "hidden");
}, 250);
