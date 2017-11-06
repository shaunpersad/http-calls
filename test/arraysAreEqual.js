"use strict";

function arraysAreEqual(arr1, arr2, join = ',') {

    return [].concat(arr1).sort().join(join) === [].concat(arr2).sort().join(join);
}

module.exports = arraysAreEqual;
