import _ from "./atomic_/core.js";
import {levels} from "./levels.js"; // level data

//the pure part of the app is here.

const legend = {
  "b": "⬜", //immobile barrier
  "g": "💎", //gem
  "v": "↕️", //vertical-movement barrier
  "h": "↔️", //horizontal-movement barrier
  "p": "👨", //pawn (or person or player)
  "e": "🚪", //exit
  "w": "⬜"  //wall
}

const difficulty = _.toArray(
  _.concat(
    _.repeat( 1, ["⬜", "intro"]),
    _.repeat(10, ["🟩", "beginner"]),
    _.repeat(10, ["🟨", "intermediate"]),
    _.repeat(10, ["🟦", "advanced"]),
    _.repeat(10, ["🟥", "expert"])));

export function init(l = 0){
  return _.chain(levels, _.nth(_, l), bounds);
}

export function icon(l){
  const w = _.getIn(difficulty, [l, 0]);
  return _.chain(legend, _.assoc(_, "w", w), _.assoc(_, "b", w), _.get(_, _));
}

export function desc(l){
  return _.getIn(difficulty, [l, 1]);
}

export function exists(l = 0){
  return !!_.get(levels, l);
}

export const move = _.partly(function(state, direction){
  const offset = _.get(directions, direction),
        bump = add(offset),
        start = _.getIn(state, ["p", 0]),
        path = ahead(start, offset),
        objs = objects(state, path),
        where = _.mapa(_.second, objs);
  return !solved(state) && allowed(objs) ? _.chain(state, _.reducekv(function(memo, what, positions){
    return _.assoc(memo, what, _.includes(["p", "h", "v", "g"], what) ? _.mapa(function(coords){
      const hit = _.detect(_.eq(_, coords), where);
      return hit ? bump(hit) : coords;
    }, positions) : positions);
  }, {}, _)) : state;
});

export function removeTreasure(contents){
  return _.update(contents, "g",  _.reduce(function(positions, exit){
    return _.mapa(function(coords){
      return _.eq(exit, coords) ? null : coords;
    }, positions);
  }, _, _.get(contents, "e")));
}

function removeWalls(contents){
  return _.update(contents, "w", _.reduce(function(positions, exit){
    return _.filtera(_.notEq(exit, _), positions);
  }, _, _.get(contents, "e")));
}

export function solved(contents){
  return !_.chain(contents, _.get(_, "g"), _.compact, _.seq);
}

const up    = [ 0, -1],
      down  = [ 0,  1],
      left  = [-1,  0],
      right = [ 1,  0];

const directions = {up, down, left, right};

function add(offset){
  return function(start){
    const [sx, sy] = start,
          [ox, oy] = offset;
    return [sx + ox, sy + oy];
  }
}

function ahead(start, offset){
  return _.chain(start, _.iterate(add(offset), _), _.take(3, _), _.toArray);
}

function objects1(state){
  return _.chain(state, _.reducekv(function(memo, what, positions){
    return _.concat(memo, _.map(function(coords){
      return [what, coords];
    }, positions));
  }, [], _), _.toArray);
}

function objects2(state, path){
  const objs = objects1(state);
  return _.chain(path, _.mapa(function(coords){
    const hit = _.detect(function([what, where]){
      return _.eq(coords, where);
    }, objs);
    return [hit ? hit[0] : null, coords];
  }, _), nothing);
}

const objects = _.overload(null, objects1, objects2);

function nothing(objs){
  const [p, [something, coords], b] = objs;
  return something ? objs : [_.first(objs)];
}

function allowed(objs){
  if (_.count(objs) < 3) {
    return true;
  }
  const [[p, [px, py]], [a, [ax, ay]], [b, [bx, by]]] = objs;
  const horizontal = py === ay,
        vertical   = !horizontal;
  return a === null
    || (a === 'g' && [null, 'e'].includes(b))
    || (a === 'h' && horizontal && b === null)
    || (a === 'v' && vertical   && b === null);
}

const walls = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], //top
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], //left
  [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], //right
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8] //bottom
];

const offset = _.partly(function(config, n) {
  return _.reducekv(function(memo, what, positions){
    return _.assoc(memo, what, _.mapa(function([x,y]){
      return [x + n, y + n];
    }, positions));
  }, {}, config);
});

const bounds = _.comp(removeWalls, _.assoc(_, "w", walls), offset(_, 1));

