/**
 * Object utility functions for nested object manipulation
 */

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Recursively adds a value to a nested object structure along a path of keys.
 * Creates intermediate objects as needed.
 * 
 * @example
 * const obj = {};
 * addValueToObject(obj, ['a', 'b', 'c'], 42);
 * // obj is now {a: {b: {c: 42}}}
 */
export function addValueToObject<T>(obj: Record<string, unknown>, keys: string[], value: T): void {
  const key = keys[0];
  if (keys.length === 1) {
    obj[key] = value;
  } else {
    if (!obj[key]) {
      obj[key] = {};
    }
    addValueToObject(obj[key] as Record<string, unknown>, keys.slice(1), value);
  }
}

/**
 * Flattens a nested object into an array of {name, value} pairs.
 * Throws TypeError if any array values are encountered.
 * 
 * @example
 * flattenObject({a: {b: 'x'}})
 * // returns [{name: 'a.b', value: 'x'}]
 */
export function flattenObject(obj: Record<string, unknown>, parentKey: string = ''): Array<{name: string; value: unknown}> {
  let result: Array<{name: string; value: unknown}> = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (Array.isArray(value)) {
        throw new TypeError(`Arrays are not supported. Found array at key: ${fullKey}`);
      } else if (typeof value === 'object' && value !== null) {
        // If it's a nested object, recurse
        result = result.concat(flattenObject(value as Record<string, unknown>, fullKey));
      } else {
        // If it's a primitive (string, number, or boolean), add it to the result
        result.push({ name: fullKey, value: value });
      }
    }
  }

  return result;
}

/**
 * Deep merges multiple objects. Later objects override earlier ones for leaf values.
 * Nested objects are recursively merged.
 * 
 * @example
 * deepMerge({a: 1, c: {x: 1}}, {b: 2, c: {y: 2}})
 * // returns {a: 1, b: 2, c: {x: 1, y: 2}}
 */
export function deepMerge(...objects: Record<string, unknown>[]): Record<string, unknown> {
  if (objects.length === 0) return {};

  const target = objects[0];
  const sources = objects.slice(1);

  if (sources.length === 0) return target;

  const source = sources[0];
  const remaining = sources.slice(1);

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as Record<string, unknown>, source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...remaining);
}
