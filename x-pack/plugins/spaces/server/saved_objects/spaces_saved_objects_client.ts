/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import Boom from '@hapi/boom';
import {
  SavedObjectsBaseOptions,
  SavedObjectsBulkCreateObject,
  SavedObjectsBulkGetObject,
  SavedObjectsBulkUpdateObject,
  SavedObjectsCheckConflictsObject,
  SavedObjectsClientContract,
  SavedObjectsCreateOptions,
  SavedObjectsFindOptions,
  SavedObjectsUpdateOptions,
  SavedObjectsAddToNamespacesOptions,
  SavedObjectsDeleteFromNamespacesOptions,
  SavedObjectsRemoveReferencesToOptions,
  SavedObjectsUtils,
  ISavedObjectTypeRegistry,
} from '../../../../../src/core/server';
import { ALL_SPACES_ID } from '../../common/constants';
import { SpacesServiceStart } from '../spaces_service/spaces_service';
import { spaceIdToNamespace } from '../lib/utils/namespace';
import { ISpacesClient } from '../spaces_client';

interface SpacesSavedObjectsClientOptions {
  baseClient: SavedObjectsClientContract;
  request: any;
  getSpacesService: () => SpacesServiceStart;
  typeRegistry: ISavedObjectTypeRegistry;
}

const coerceToArray = (param: string | string[]) => {
  if (Array.isArray(param)) {
    return param;
  }

  return [param];
};

const throwErrorIfNamespaceSpecified = (options: any) => {
  if (options.namespace) {
    throw new Error('Spaces currently determines the namespaces');
  }
};

export class SpacesSavedObjectsClient implements SavedObjectsClientContract {
  private readonly client: SavedObjectsClientContract;
  private readonly spaceId: string;
  private readonly types: string[];
  private readonly spacesClient: ISpacesClient;
  public readonly errors: SavedObjectsClientContract['errors'];

  constructor(options: SpacesSavedObjectsClientOptions) {
    const { baseClient, request, getSpacesService, typeRegistry } = options;

    const spacesService = getSpacesService();

    this.client = baseClient;
    this.spacesClient = spacesService.createSpacesClient(request);
    this.spaceId = spacesService.getSpaceId(request);
    this.types = typeRegistry.getAllTypes().map((t) => t.name);
    this.errors = baseClient.errors;
  }

  /**
   * Check what conflicts will result when creating a given array of saved objects. This includes "unresolvable conflicts", which are
   * multi-namespace objects that exist in a different namespace; such conflicts cannot be resolved/overwritten.
   *
   * @param objects
   * @param options
   */
  public async checkConflicts(
    objects: SavedObjectsCheckConflictsObject[] = [],
    options: SavedObjectsBaseOptions = {}
  ) {
    throwErrorIfNamespaceSpecified(options);

    return await this.client.checkConflicts(objects, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * Persists an object
   *
   * @param {string} type
   * @param {object} attributes
   * @param {object} [options={}]
   * @property {string} [options.id] - force id on creation, not recommended
   * @property {boolean} [options.overwrite=false]
   * @property {string} [options.namespace]
   * @returns {promise} - { id, type, version, attributes }
   */
  public async create<T = unknown>(
    type: string,
    attributes: T = {} as T,
    options: SavedObjectsCreateOptions = {}
  ) {
    throwErrorIfNamespaceSpecified(options);

    return await this.client.create<T>(type, attributes, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * Creates multiple documents at once
   *
   * @param {array} objects - [{ type, id, attributes }]
   * @param {object} [options={}]
   * @property {boolean} [options.overwrite=false] - overwrites existing documents
   * @property {string} [options.namespace]
   * @returns {promise} - { saved_objects: [{ id, type, version, attributes, error: { message } }]}
   */
  public async bulkCreate<T = unknown>(
    objects: Array<SavedObjectsBulkCreateObject<T>>,
    options: SavedObjectsBaseOptions = {}
  ) {
    throwErrorIfNamespaceSpecified(options);

    return await this.client.bulkCreate(objects, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * Deletes an object
   *
   * @param {string} type
   * @param {string} id
   * @param {object} [options={}]
   * @property {string} [options.namespace]
   * @returns {promise}
   */
  public async delete(type: string, id: string, options: SavedObjectsBaseOptions = {}) {
    throwErrorIfNamespaceSpecified(options);

    return await this.client.delete(type, id, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * @param {object} [options={}]
   * @property {(string|Array<string>)} [options.type]
   * @property {string} [options.search]
   * @property {string} [options.defaultSearchOperator]
   * @property {Array<string>} [options.searchFields] - see Elasticsearch Simple Query String
   *                                        Query field argument for more information
   * @property {integer} [options.page=1]
   * @property {integer} [options.perPage=20]
   * @property {string} [options.sortField]
   * @property {string} [options.sortOrder]
   * @property {Array<string>} [options.fields]
   * @property {string} [options.namespaces]
   * @property {object} [options.hasReference] - { type, id }
   * @returns {promise} - { saved_objects: [{ id, type, version, attributes }], total, per_page, page }
   */
  public async find<T = unknown>(options: SavedObjectsFindOptions) {
    throwErrorIfNamespaceSpecified(options);

    let namespaces = options.namespaces;
    if (namespaces) {
      try {
        const availableSpaces = await this.spacesClient.getAll({ purpose: 'findSavedObjects' });
        if (namespaces.includes(ALL_SPACES_ID)) {
          namespaces = availableSpaces.map((space) => space.id);
        } else {
          namespaces = namespaces.filter((namespace) =>
            availableSpaces.some((space) => space.id === namespace)
          );
        }
        if (namespaces.length === 0) {
          // return empty response, since the user is unauthorized in this space (or these spaces), but we don't return forbidden errors for `find` operations
          return SavedObjectsUtils.createEmptyFindResponse<T>(options);
        }
      } catch (err) {
        if (Boom.isBoom(err) && err.output.payload.statusCode === 403) {
          // return empty response, since the user is unauthorized in any space, but we don't return forbidden errors for `find` operations
          return SavedObjectsUtils.createEmptyFindResponse<T>(options);
        }
        throw err;
      }
    } else {
      namespaces = [this.spaceId];
    }

    return await this.client.find<T>({
      ...options,
      type: (options.type ? coerceToArray(options.type) : this.types).filter(
        (type) => type !== 'space'
      ),
      namespaces,
    });
  }

  /**
   * Returns an array of objects by id
   *
   * @param {array} objects - an array ids, or an array of objects containing id and optionally type
   * @param {object} [options={}]
   * @property {string} [options.namespace]
   * @returns {promise} - { saved_objects: [{ id, type, version, attributes }] }
   * @example
   *
   * bulkGet([
   *   { id: 'one', type: 'config' },
   *   { id: 'foo', type: 'index-pattern' }
   * ])
   */
  public async bulkGet<T = unknown>(
    objects: SavedObjectsBulkGetObject[] = [],
    options: SavedObjectsBaseOptions = {}
  ) {
    throwErrorIfNamespaceSpecified(options);

    return await this.client.bulkGet<T>(objects, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * Gets a single object
   *
   * @param {string} type
   * @param {string} id
   * @param {object} [options={}]
   * @property {string} [options.namespace]
   * @returns {promise} - { id, type, version, attributes }
   */
  public async get<T = unknown>(type: string, id: string, options: SavedObjectsBaseOptions = {}) {
    throwErrorIfNamespaceSpecified(options);

    return await this.client.get<T>(type, id, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * Resolves a single object, using any legacy URL alias if it exists
   *
   * @param type - The type of SavedObject to retrieve
   * @param id - The ID of the SavedObject to retrieve
   * @param {object} [options={}]
   * @property {string} [options.namespace]
   * @returns {promise} - { saved_object, outcome }
   */
  public async resolve<T = unknown>(
    type: string,
    id: string,
    options: SavedObjectsBaseOptions = {}
  ) {
    throwErrorIfNamespaceSpecified(options);

    return await this.client.resolve<T>(type, id, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * Updates an object
   *
   * @param {string} type
   * @param {string} id
   * @param {object} [options={}]
   * @property {string} options.version - ensures version matches that of persisted object
   * @property {string} [options.namespace]
   * @returns {promise}
   */
  public async update<T = unknown>(
    type: string,
    id: string,
    attributes: Partial<T>,
    options: SavedObjectsUpdateOptions = {}
  ) {
    throwErrorIfNamespaceSpecified(options);

    return await this.client.update(type, id, attributes, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * Adds namespaces to a SavedObject
   *
   * @param type
   * @param id
   * @param namespaces
   * @param options
   */
  public async addToNamespaces(
    type: string,
    id: string,
    namespaces: string[],
    options: SavedObjectsAddToNamespacesOptions = {}
  ) {
    throwErrorIfNamespaceSpecified(options);

    return await this.client.addToNamespaces(type, id, namespaces, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * Removes namespaces from a SavedObject
   *
   * @param type
   * @param id
   * @param namespaces
   * @param options
   */
  public async deleteFromNamespaces(
    type: string,
    id: string,
    namespaces: string[],
    options: SavedObjectsDeleteFromNamespacesOptions = {}
  ) {
    throwErrorIfNamespaceSpecified(options);

    return await this.client.deleteFromNamespaces(type, id, namespaces, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * Updates an array of objects by id
   *
   * @param {array} objects - an array ids, or an array of objects containing id, type, attributes and optionally version, references and namespace
   * @returns {promise} - { saved_objects: [{ id, type, version, attributes }] }
   * @example
   *
   * bulkUpdate([
   *   { id: 'one', type: 'config', attributes: { title: 'My new title'}, version: 'd7rhfk47d=' },
   *   { id: 'foo', type: 'index-pattern', attributes: {} }
   * ])
   */
  public async bulkUpdate<T = unknown>(
    objects: Array<SavedObjectsBulkUpdateObject<T>> = [],
    options: SavedObjectsBaseOptions = {}
  ) {
    throwErrorIfNamespaceSpecified(options);
    return await this.client.bulkUpdate(objects, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }

  /**
   * Remove outward references to given object.
   *
   * @param type
   * @param id
   * @param options
   */
  public async removeReferencesTo(
    type: string,
    id: string,
    options: SavedObjectsRemoveReferencesToOptions = {}
  ) {
    throwErrorIfNamespaceSpecified(options);
    return await this.client.removeReferencesTo(type, id, {
      ...options,
      namespace: spaceIdToNamespace(this.spaceId),
    });
  }
}
