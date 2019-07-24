/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import gql from 'graphql-tag';

export const metadataQuery = gql`
  query MetadataQuery($sourceId: ID!, $nodeId: String!, $nodeType: InfraNodeType!) {
    source(id: $sourceId) {
      id
      metadataByNode(nodeId: $nodeId, nodeType: $nodeType) {
        name
        features {
          name
          source
        }
        info {
          cloud {
            instance {
              id
              name
            }
            provider
            availability_zone
            project {
              id
            }
            machine {
              type
            }
          }
          host {
            name
            os {
              codename
              family
              kernel
              name
              platform
              version
            }
            architecture
            containerized
          }
        }
      }
    }
  }
`;
