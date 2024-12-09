const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'atlas-hack_sprint_adventure-1',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;
