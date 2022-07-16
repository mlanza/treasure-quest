import _ from "./@atomic/core.js";

const legend = {
  "b": "🏛️", //immobile barrier
  "g": "💎", //gem
  "v": "↕️", //vertical-movement barrier
  "h": "↔️", //horizontal-movement barrier
  "p": "👨", //pawn (or person or player)
  "e": "🚪", //exit
  "w": "🏛️"  //wall
}

const up    = [ 0, -1],
      down  = [ 0,  1],
      left  = [-1,  0],
      right = [ 1,  0];
const directions = {up, down, left, right};

export function init(l = 1){
  return _.chain(levels, _.nth(_, l - 1), bounds);
}

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
  }, _));
}

const objects = _.overload(null, objects1, objects2);

function allowed([[p, [px, py]], [a, [ax, ay]], [b, [bx, by]]]){
  const horizontal = py === ay,
        vertical   = !horizontal;
  return a === null
    || (a === 'g' && [null, 'e'].includes(b))
    || (a === 'h' && horizontal && b === null)
    || (a === 'v' && vertical   && b === null);
}

export const move = _.partly(function(state, direction){
  const offset = _.get(directions, direction);
  const bump = add(offset);
  const start = _.getIn(state, ["p", 0]);
  const path = ahead(start, offset);
  const objs = objects(state, path);
  const where = _.mapa(_.second, objs);
  return allowed(objs) ? _.reducekv(function(memo, what, positions){
    return _.assoc(memo, what, _.includes(["p", "h", "v", "g"], what) ? _.mapa(function(coords){
      const hit = _.detect(_.eq(_, coords), where);
      return hit ? bump(hit) : coords;
    }, positions) : positions);
  }, {}, state) : state;
});

export const icon = _.get(legend, _, "•");

const walls = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], //top
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], //left
  [8, 1], [8, 2], [8, 3],         [8, 5], [8, 6], [8, 7], //right
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8] //bottom
];

const exits = [[8, 4]];

const offset = _.partly(function(config, n) {
  return _.reducekv(function(memo, what, positions){
    return _.assoc(memo, what, _.mapa(function([x,y]){
      return [x + n, y + n];
    }, positions));
  }, {}, config);
});

const bounds = _.comp(_.merge(_, {"w": walls, "e": exits}), offset(_, 1));

const levels = [{
  "b": [[2, 3]],
  "g": [[3, 3]],
  "v": [[4, 3]],
  "h": [[5, 3]],
  "p": [[6, 3]]
}];
