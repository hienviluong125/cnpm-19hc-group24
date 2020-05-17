module.exports = function(attrs) {
  let _object = {};
  for(let attr of attrs) {
    _object[attr] = '';
  }
  return _object;
}
