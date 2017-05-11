import './vis_controller';
import './editor_controller';
import 'react-select/dist/react-select.css';
import '../../../metrics/public/less/main.less';
import '../less/main.less';
import image from '../images/icon-table.svg';
import { TemplateVisTypeProvider } from 'ui/template_vis_type';

import { VisVisTypeProvider } from 'ui/vis/vis_type';
// register the provider with the visTypes registry so that other know it exists
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
VisTypesRegistryProvider.register(MetricsVisProvider);

export default function MetricsVisProvider(Private) {
  const VisType = Private(VisVisTypeProvider);
  const TemplateVisType = Private(TemplateVisTypeProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return new TemplateVisType({
    name: 'summarize',
    title: 'Summarizer',
    image,
    description: 'Build a table of summarized data',
    category: VisType.CATEGORY.DATA,
    isExperimental: true,
    template: require('./vis.html'),
    fullEditor: true,
    params: {
      editor: require('./editor.html')
    },
    requiresSearch: false,
    requiresTimePicker: true,
    implementsRenderComplete: true,
  });
}
