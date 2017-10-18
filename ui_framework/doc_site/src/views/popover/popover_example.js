import React from 'react';

import { renderToHtml } from '../../services';

import {
  GuideDemo,
  GuidePage,
  GuideSection,
  GuideSectionTypes,
  GuideText,
} from '../../components';

import Popover from './popover';
const popoverSource = require('!!raw!./popover');
const popoverHtml = renderToHtml(Popover);

import PopoverAnchorPosition from './popover_anchor_position';
const popoverAnchorPositionSource = require('!!raw!./popover_anchor_position');
const popoverAnchorPositionHtml = renderToHtml(PopoverAnchorPosition);

import PopoverPanelClassName from './popover_panel_class_name';
const popoverPanelClassNameSource = require('!!raw!./popover_panel_class_name');
const popoverPanelClassNameHtml = renderToHtml(PopoverPanelClassName);

import PopoverWithTitle from './popover_with_title';
const popoverWithTitleSource = require('!!raw!./popover_with_title');
const popoverWithTitleHtml = renderToHtml(PopoverWithTitle);

export default props => (
  <GuidePage title={props.route.name}>
    <GuideSection
      title="Popover"
      source={[{
        type: GuideSectionTypes.JS,
        code: popoverSource,
      }, {
        type: GuideSectionTypes.HTML,
        code: popoverHtml,
      }]}
    >
      <GuideText>
        Use the Popover component to hide controls or options behind a clickable element.
      </GuideText>

      <GuideDemo>
        <Popover />
      </GuideDemo>
    </GuideSection>

    <GuideSection
      title="Popover with title"
      source={[{
        type: GuideSectionTypes.JS,
        code: popoverWithTitleSource,
      }, {
        type: GuideSectionTypes.HTML,
        code: popoverWithTitleHtml,
      }]}
    >
      <GuideText>
        Popovers often have need for titling. This can be applied through
        a prop or used separately as its own component
        KuiPopoverTitle nested somwhere in the child
        prop.
      </GuideText>

      <GuideDemo>
        <PopoverWithTitle />
      </GuideDemo>
    </GuideSection>

    <GuideSection
      title="Anchor position"
      source={[{
        type: GuideSectionTypes.JS,
        code: popoverAnchorPositionSource,
      }, {
        type: GuideSectionTypes.HTML,
        code: popoverAnchorPositionHtml,
      }]}
    >
      <GuideText>
        The alignment and arrow on your popover can be set with
        the anchorPostion prop.
      </GuideText>

      <GuideDemo>
        <PopoverAnchorPosition />
      </GuideDemo>
    </GuideSection>

    <GuideSection
      title="Panel class name and padding size"
      source={[{
        type: GuideSectionTypes.JS,
        code: popoverPanelClassNameSource,
      }, {
        type: GuideSectionTypes.HTML,
        code: popoverPanelClassNameHtml,
      }]}
    >
      <GuideText>
        Use the panelPaddingSize prop to adjust the padding
        on the panel within the panel. Use the panelClassName
        prop to pass a custom class to the panel.
        inside a popover.
      </GuideText>

      <GuideDemo>
        <PopoverPanelClassName />
      </GuideDemo>
    </GuideSection>
  </GuidePage>
);
