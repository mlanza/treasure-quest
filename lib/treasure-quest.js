import _ from "./@atomic/core.js";

const legend = {
  "b": "•", //immobile barrier
  "g": "💎", //gem
  "v": "↕️", //vertical-movement barrier
  "h": "↔️", //horizontal-movement barrier
  "p": "👨", //pawn (or person or player)
}

export function init(l = 1){
  const setup = _.nth(levels, l - 1);
  const row = _.toArray(_.repeat(7, null));
  const rows = _.toArray(_.repeat(7, row));
  return _.reducekv(function(memo, what, where){
    return _.reduce(function(memo, coords){
      return _.assocIn(memo, coords, what);
    }, memo, where);
  }, rows, setup);
}

export function move(state, direction){

}

export const icon = _.get(legend, _, "•");

const l1 = {
  "b": [[3,2]],
  "g": [[3,3]],
  "v": [[3,4]],
  "h": [[3,5]],
  "p": [[3,6]]
}

const levels = [l1]
