function withAliases(exports, original, ...aliases) {
  aliases.forEach(alias => {
    exports[alias] = original;
  });
}
module.exports = withAliases;
