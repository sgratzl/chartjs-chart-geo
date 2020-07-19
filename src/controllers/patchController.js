import { registry } from '@sgratzl/chartjs-esm-facade';

export default function patchController(config, controller, elements = [], scales = []) {
  registry.addControllers(controller);
  registry.addElements(elements);
  registry.addScales(scales);
  config.type = controller.id;
  return config;
}
