import React from 'react';
import { getDisplayName } from './lib/get_display_name';
import { last } from 'lodash';
import calculateLabel  from '../../common/calculate_label';
export function visWithSplits(WrappedComponent) {
  function SplitVisComponent(props) {
    const { model, visData } = props;
    if (model.series.some(s => s.split_mode === 'everything')) {
      return (<WrappedComponent { ...props } />);
    }

    const splitsVisData = visData[model.id].series.reduce((acc, series) => {
      const [seriesId, splitId] = series.id.split(':');
      const seriesModel = model.series.find(s => s.id === seriesId);
      const metric = last(seriesModel.metrics);
      const label = calculateLabel(metric, seriesModel.metrics);
      if (!acc[splitId]) acc[splitId] = { series: [], label: series.label };
      acc[splitId].series.push({
        ...series,
        id: seriesId,
        label: seriesModel.label || label
      });
      return acc;
    }, {});

    const rows = Object.keys(splitsVisData).map(key => {
      const splitData = splitsVisData[key];
      const { series, label } = splitData;
      const newVisData = {
        [model.id]: {
          id: model.id,
          series
        }
      };
      return (
        <div key={key} className="splitVis_split">
          <div className="splitVis_visualization">
            <WrappedComponent
              model={model}
              visData={newVisData}
              onBrush={props.onBrush}
              backgroundColor={props.backgroundColor}
            />
          </div>
          <div className="splitVis_label">{label}</div>
        </div>
      );
    });

    return (
      <div className="splitVis">{rows}</div>
    );
  }
  SplitVisComponent.displayName = `SplitVisComponent(${getDisplayName(WrappedComponent)})`;
  return SplitVisComponent;
}
