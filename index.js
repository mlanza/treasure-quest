import _ from "./lib/@atomic/core.js";
import dom from "./lib/@atomic/dom.js";
import $ from "./lib/@atomic/reactives.js";
import * as cmd from "./lib/cmd.js";
import * as q from "./lib/treasure-quest.js";

const $state = $.cell(q.init());
const el = dom.sel1("#quest");
const td = dom.tag('td');
const tr = dom.tag('tr');
const tbody = dom.tag('tbody');

$.sub($state, function(rows){
  _.chain(rows, _.mapa(_.comp(tr, function(row){
    return _.mapa(function(key){
      return td(key ? {"data-piece": key} : null, q.icon(key));
    }, row);
  }), _), dom.html(el, _));
});

