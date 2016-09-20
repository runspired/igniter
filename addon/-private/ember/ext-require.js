import Ember from 'ember';

const {
  __loader
} = Ember;

export default function(moduleName, exportName = 'default') {
  let module = __loader.require(moduleName);

  return module[exportName];
}
