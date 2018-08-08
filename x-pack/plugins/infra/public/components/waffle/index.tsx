/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { findDOMNode } from 'react-dom';
import styled from 'styled-components';
import { AutoSizer } from '../auto_sizer';
import { GroupOfGroups } from './group_of_groups';
import { GroupOfNodes } from './group_of_nodes';

import {
  isWaffleMapGroupWithGroups,
  isWaffleMapGroupWithNodes,
} from '../../containers/libs/type_guards';
import { InfraWaffleData, InfraWaffleMapGroup, InfraWaffleOptions } from '../../lib/lib';
import { applyWaffleMapLayout } from './lib/apply_wafflemap_layout';

interface WafleMapProps {
  options: InfraWaffleOptions;
  map: InfraWaffleData;
}

const initialState = {
  hasScroll: false,
};

type WaffleMapState = Readonly<typeof initialState>;

export class Waffle extends React.Component<WafleMapProps, WaffleMapState> {
  public readonly state: WaffleMapState = initialState;
  private outer: any;
  private inner: any;
  private scrollBarTimer: any;

  public render() {
    return (
      <AutoSizer content>
        {({ measureRef, content: { width = 0, height = 0 } }) => {
          const { hasScroll } = this.state;
          const { map } = this.props;
          const groupsWithLayout = applyWaffleMapLayout(map, width, height);
          return (
            <Container innerRef={(el: any) => measureRef(el)}>
              <MapContainer>
                {groupsWithLayout.map(this.renderGroup)}
              </MapContainer>
            </Container>
          );
        }}
      </AutoSizer>
    );
  }

  public componentWillMount() {
    const check = () => {
      this.scrollBarTimer = setTimeout(() => {
        const el = findDOMNode(this.outer);
        if (el instanceof Element) {
          const hasScroll = el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
          this.setState({ hasScroll }, check);
        }
      }, 500);
    };
    check();
  }

  public componentWillUnmount() {
    clearTimeout(this.scrollBarTimer);
  }

  // TODO: Change this to a real implimentation using the tickFormatter from the prototype as an example.
  private formatter(val: string | number) {
    return String(val);
  }

  private handleDrilldown() {
    return;
  }

  private renderGroup = (group: InfraWaffleMapGroup) => {
    if (isWaffleMapGroupWithGroups(group)) {
      return (
        <GroupOfGroups
          onDrilldown={this.handleDrilldown}
          key={group.id}
          options={this.props.options}
          group={group}
          formatter={this.formatter}
        />
      );
    }
    if (isWaffleMapGroupWithNodes(group)) {
      return (
        <GroupOfNodes
          key={group.id}
          options={this.props.options}
          group={group}
          onDrilldown={this.handleDrilldown}
          formatter={this.formatter}
          isChild={false}
        />
      );
    }
  };
}

const Container = styled.div`
  flex: 1 0 0;
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
`;

const MapContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  padding: 10px;
`;
