/*
 *  Copyright 2022 Collate.
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

import { Col, Divider, Row, Typography } from 'antd';
import { AxiosError } from 'axios';
import SummaryTagsDescription from 'components/common/SummaryTagsDescription/SummaryTagsDescription.component';
import SummaryPanelSkeleton from 'components/Skeleton/SummaryPanelSkeleton/SummaryPanelSkeleton.component';
import TagsViewer from 'components/Tag/TagsViewer/TagsViewer';
import { ExplorePageTabs } from 'enums/Explore.enum';
import { TagLabel } from 'generated/type/tagLabel';
import { ChartType } from 'pages/DashboardDetailsPage/DashboardDetailsPage.component';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTagValue } from 'utils/CommonUtils';
import {
  DRAWER_NAVIGATION_OPTIONS,
  getEntityOverview,
} from 'utils/EntityUtils';
import { SummaryEntityType } from '../../../../enums/EntitySummary.enum';
import { Dashboard } from '../../../../generated/entity/data/dashboard';
import { fetchCharts } from '../../../../utils/DashboardDetailsUtils';
import { getFormattedEntityData } from '../../../../utils/EntitySummaryPanelUtils';
import { showErrorToast } from '../../../../utils/ToastUtils';
import CommonEntitySummaryInfo from '../CommonEntitySummaryInfo/CommonEntitySummaryInfo';
import SummaryList from '../SummaryList/SummaryList.component';
import { BasicEntityInfo } from '../SummaryList/SummaryList.interface';

interface DashboardSummaryProps {
  entityDetails: Dashboard;
  componentType?: DRAWER_NAVIGATION_OPTIONS;
  tags?: TagLabel[];
  isLoading?: boolean;
}

function DashboardSummary({
  entityDetails,
  componentType = DRAWER_NAVIGATION_OPTIONS.explore,
  tags,
  isLoading,
}: DashboardSummaryProps) {
  const { t } = useTranslation();
  const [charts, setCharts] = useState<ChartType[]>();

  const fetchChartsDetails = async () => {
    try {
      const chartDetails = await fetchCharts(entityDetails.charts);

      const updatedCharts = chartDetails.map((chartItem) => ({
        ...chartItem,
        sourceUrl: chartItem.sourceUrl,
      }));

      setCharts(updatedCharts);
    } catch (err) {
      showErrorToast(
        err as AxiosError,
        t('server.entity-fetch-error', {
          entity: t('label.dashboard-detail-plural-lowercase'),
        })
      );
    }
  };

  const entityInfo = useMemo(
    () => getEntityOverview(ExplorePageTabs.DASHBOARDS, entityDetails),
    [entityDetails]
  );

  useEffect(() => {
    fetchChartsDetails();
  }, [entityDetails]);

  const formattedChartsData: BasicEntityInfo[] = useMemo(
    () => getFormattedEntityData(SummaryEntityType.CHART, charts),
    [charts]
  );

  const formattedDataModelData: BasicEntityInfo[] = useMemo(
    () =>
      getFormattedEntityData(
        SummaryEntityType.COLUMN,
        entityDetails.dataModels
      ),
    [charts]
  );

  const isExplore = useMemo(
    () => componentType === DRAWER_NAVIGATION_OPTIONS.explore,
    [componentType]
  );

  return (
    <SummaryPanelSkeleton loading={Boolean(isLoading)}>
      <>
        <Row className="m-md m-t-0" gutter={[0, 4]}>
          <Col span={24}>
            <CommonEntitySummaryInfo
              componentType={componentType}
              entityInfo={entityInfo}
            />
          </Col>
        </Row>
        <Divider className="m-y-xs" />

        {!isExplore ? (
          <>
            <SummaryTagsDescription
              entityDetail={entityDetails}
              tags={tags ?? []}
            />
            <Divider className="m-y-xs" />
          </>
        ) : (
          <>
            <Row className="m-md" gutter={[0, 8]}>
              <Col span={24}>
                <Typography.Text
                  className="summary-panel-section-title"
                  data-testid="profiler-header">
                  {t('label.tag-plural')}
                </Typography.Text>
              </Col>

              <Col className="flex-grow" span={24}>
                {entityDetails.tags && entityDetails.tags.length > 0 ? (
                  <TagsViewer
                    sizeCap={2}
                    tags={(entityDetails.tags || []).map((tag) =>
                      getTagValue(tag)
                    )}
                  />
                ) : (
                  <Typography.Text className="text-grey-body">
                    {t('label.no-tags-added')}
                  </Typography.Text>
                )}
              </Col>
            </Row>
            <Divider className="m-y-xs" />
          </>
        )}

        <Row className="m-md" gutter={[0, 8]}>
          <Col span={24}>
            <Typography.Text
              className="summary-panel-section-title"
              data-testid="charts-header">
              {t('label.chart-plural')}
            </Typography.Text>
          </Col>
          <Col span={24}>
            <SummaryList formattedEntityData={formattedChartsData} />
          </Col>
        </Row>

        <Divider className="m-y-xs" />

        <Row className="m-md" gutter={[0, 8]}>
          <Col span={24}>
            <Typography.Text
              className="summary-panel-section-title"
              data-testid="data-model-header">
              {t('label.data-model-plural')}
            </Typography.Text>
          </Col>
          <Col span={24}>
            <SummaryList formattedEntityData={formattedDataModelData} />
          </Col>
        </Row>
      </>
    </SummaryPanelSkeleton>
  );
}

export default DashboardSummary;
