/*
 *  Copyright 2023 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { COMMON_UI_SCHEMA } from 'constants/Services.constant';
import { SearchServiceType } from 'generated/entity/services/searchService';
import customSearchConnection from 'jsons/connectionSchemas/connections/search/customSearchConnection.json';
import elasticSearchConnection from 'jsons/connectionSchemas/connections/search/elasticSearchConnection.json';
import openSearchConnection from 'jsons/connectionSchemas/connections/search/openSearchConnection.json';
import { cloneDeep } from 'lodash';

export const getSearchServiceConfig = (type: SearchServiceType) => {
  let schema = {};
  const uiSchema = { ...COMMON_UI_SCHEMA };
  switch (type) {
    case SearchServiceType.ElasticSearch: {
      schema = elasticSearchConnection;

      break;
    }
    case SearchServiceType.OpenSearch: {
      schema = openSearchConnection;

      break;
    }
    case SearchServiceType.CustomSearch: {
      schema = customSearchConnection;

      break;
    }
  }

  return cloneDeep({ schema, uiSchema });
};
