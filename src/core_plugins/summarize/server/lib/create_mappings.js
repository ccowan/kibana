import _ from 'lodash';

export function createKeyword(properties, field) {
  const key = field.replace(/\./, '.properties.');
  _.set(properties, key, {
    type: 'keyword'
  });
}

export function createColumn(properties, field) {
  const key = field.replace(/\./, '.properties.');
  _.set(properties, key, {
    properties: {
      label: {
        type: 'keyword'
      },
      last: { type: 'float' },
      slope: { type: 'float' },
      yIntercept: { type: 'float' }
    }
  });
}

export function createMappings(server, doc) {
  const client = server.plugins.elasticsearch.getCluster('summarize').callWithInternalUser;
  const model = doc.visState.params;
  const params = {
    index: model.target_index,
    type: 'doc',
    body: {
      properties: {
        '@updatedOn': {
          type: 'date'
        }
      }
    }
  };

  const { properties } = params.body;


  createKeyword(properties, model.id_field);

  if (model.display_field) {
    createKeyword(properties, model.display_field);
  }

  model.columns.forEach(column => {
    createColumn(properties, `data.${column.id}`);
  });

  return client('indices.exists', { index: model.target_index }).then(exists => {
    if (exists) {
      return client('indices.putMapping', params);
    } else {
      delete params.type;
      params.body = {
        mappings: { doc: { ...params.body } }
      };
      return client('indices.create', params);
    }
  });
}
