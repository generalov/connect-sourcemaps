"use strict";

function onClick() {
  var value = [1, 2, 3].map(function (n) {
    return n + 1;
  });
  console.log(value);
}