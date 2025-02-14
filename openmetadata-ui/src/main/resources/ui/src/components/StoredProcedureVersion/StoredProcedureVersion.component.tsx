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

import { Col, Row, Space, Tabs, TabsProps } from 'antd';
import classNames from 'classnames';
import { CustomPropertyTable } from 'components/common/CustomPropertyTable/CustomPropertyTable';
import { CustomPropertyProps } from 'components/common/CustomPropertyTable/CustomPropertyTable.interface';
import DescriptionV1 from 'components/common/description/DescriptionV1';
import DataAssetsVersionHeader from 'components/DataAssets/DataAssetsVersionHeader/DataAssetsVersionHeader';
import EntityVersionTimeLine from 'components/Entity/EntityVersionTimeLine/EntityVersionTimeLine';
import Loader from 'components/Loader/Loader';
import TabsLabel from 'components/TabsLabel/TabsLabel.component';
import TagsContainerV2 from 'components/Tag/TagsContainerV2/TagsContainerV2';
import { getVersionPathWithTab } from 'constants/constants';
import { EntityField } from 'constants/Feeds.constants';
import { TagSource } from 'generated/type/tagLabel';
import { toString } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { EntityTabs, EntityType } from '../../enums/entity.enum';
import { ChangeDescription } from '../../generated/entity/data/table';
import {
  getCommonExtraInfoForVersionDetails,
  getEntityVersionByField,
  getEntityVersionTags,
} from '../../utils/EntityVersionUtils';
import { StoredProcedureVersionProp } from './StoredProcedureVersion.interface';
const StoredProcedureVersion = ({
  version,
  currentVersionData,
  isVersionLoading,
  owner,
  domain,
  tier,
  slashedTableName,
  storedProcedureFQN,
  versionList,
  deleted = false,
  backHandler,
  versionHandler,
  entityPermissions,
}: StoredProcedureVersionProp) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { tab } = useParams<{ tab: EntityTabs }>();
  const [changeDescription, setChangeDescription] = useState<ChangeDescription>(
    currentVersionData.changeDescription as ChangeDescription
  );

  const { ownerDisplayName, ownerRef, tierDisplayName, domainDisplayName } =
    useMemo(
      () =>
        getCommonExtraInfoForVersionDetails(
          changeDescription,
          owner,
          tier,
          domain
        ),
      [changeDescription, owner, tier, domain]
    );

  const { tags, description, displayName } = useMemo(
    () => ({
      tags: getEntityVersionTags(currentVersionData, changeDescription),
      description: getEntityVersionByField(
        changeDescription,
        EntityField.DESCRIPTION,
        currentVersionData.description
      ),
      displayName: getEntityVersionByField(
        changeDescription,
        EntityField.DISPLAYNAME,
        currentVersionData.displayName
      ),
    }),
    [currentVersionData, changeDescription]
  );

  const handleTabChange = (activeKey: string) => {
    history.push(
      getVersionPathWithTab(
        EntityType.STORED_PROCEDURE,
        storedProcedureFQN,
        String(version),
        activeKey
      )
    );
  };

  useEffect(() => {
    setChangeDescription(
      currentVersionData.changeDescription as ChangeDescription
    );
  }, [currentVersionData]);

  const tabItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: EntityTabs.CODE,
        label: <TabsLabel id={EntityTabs.CODE} name={t('label.code')} />,
        children: (
          <Row gutter={[0, 16]} wrap={false}>
            <Col className="p-t-sm m-x-lg" flex="auto">
              <Row gutter={[0, 16]}>
                <Col span={24}>
                  <DescriptionV1
                    isVersionView
                    description={description}
                    entityType={EntityType.STORED_PROCEDURE}
                  />
                </Col>
              </Row>
            </Col>
            <Col
              className="entity-tag-right-panel-container"
              data-testid="entity-right-panel"
              flex="220px">
              <Space className="w-full" direction="vertical" size="large">
                {Object.keys(TagSource).map((tagType) => (
                  <TagsContainerV2
                    entityFqn={storedProcedureFQN}
                    entityType={EntityType.STORED_PROCEDURE}
                    key={tagType}
                    permission={false}
                    selectedTags={tags}
                    tagType={TagSource[tagType as TagSource]}
                  />
                ))}
              </Space>
            </Col>
          </Row>
        ),
      },
      {
        key: EntityTabs.CUSTOM_PROPERTIES,
        label: (
          <TabsLabel
            id={EntityTabs.CUSTOM_PROPERTIES}
            name={t('label.custom-property-plural')}
          />
        ),
        children: (
          <CustomPropertyTable
            isVersionView
            entityDetails={
              currentVersionData as CustomPropertyProps['entityDetails']
            }
            entityType={EntityType.STORED_PROCEDURE}
            hasEditAccess={false}
            hasPermission={entityPermissions.ViewAll}
          />
        ),
      },
    ],
    [description, storedProcedureFQN, currentVersionData, entityPermissions]
  );

  return (
    <>
      {isVersionLoading ? (
        <Loader />
      ) : (
        <div className={classNames('version-data')}>
          <Row gutter={[0, 12]}>
            <Col span={24}>
              <DataAssetsVersionHeader
                breadcrumbLinks={slashedTableName}
                currentVersionData={currentVersionData}
                deleted={deleted}
                displayName={displayName}
                domainDisplayName={domainDisplayName}
                entityType={EntityType.STORED_PROCEDURE}
                ownerDisplayName={ownerDisplayName}
                ownerRef={ownerRef}
                serviceName={currentVersionData.service?.name}
                tierDisplayName={tierDisplayName}
                version={version}
                onVersionClick={backHandler}
              />
            </Col>
            <Col span={24}>
              <Tabs
                defaultActiveKey={tab ?? EntityTabs.CODE}
                items={tabItems}
                onChange={handleTabChange}
              />
            </Col>
          </Row>
        </div>
      )}

      <EntityVersionTimeLine
        currentVersion={toString(version)}
        versionHandler={versionHandler}
        versionList={versionList}
        onBack={backHandler}
      />
    </>
  );
};

export default StoredProcedureVersion;
