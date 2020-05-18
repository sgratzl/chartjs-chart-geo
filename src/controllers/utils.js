export function patchControllerConfig(config, controller) {
  controller.register();
  config.type = controller.id;
  return config;
}
