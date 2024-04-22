import 'reflect-metadata';
/**
 * Copies all metadata from one object to another.
 * Useful for overwriting function definition in
 * decorators while keeping all previously
 * attached metadata
 *
 * @param from object to copy metadata from
 * @param to object to copy metadata to
 */
function copyMetadata(from: object, to: object) {
  const metadataKeys = Reflect.getMetadataKeys(from);

  for (const key of metadataKeys) {
    const value: unknown = Reflect.getMetadata(key, from);

    Reflect.defineMetadata(key, value, to);
  }
}

export function DecorateAll(decorator: MethodDecorator): ClassDecorator {
  return (target: Function) => {
    const descriptors = Object.getOwnPropertyDescriptors(target.prototype);

    for (const [propertyKey, descriptor] of Object.entries(descriptors)) {
      const isMethod =
        typeof descriptor.value === 'function' && propertyKey !== 'constructor';
      if (!isMethod) {
        continue;
      }
      const originalMethod = descriptor.value as Function;
      decorator(target, propertyKey, descriptor);
      if (originalMethod !== descriptor.value) {
        copyMetadata(originalMethod, descriptor.value as Function);
      }

      Object.defineProperty(target.prototype, propertyKey, descriptor);
    }
  };
}
