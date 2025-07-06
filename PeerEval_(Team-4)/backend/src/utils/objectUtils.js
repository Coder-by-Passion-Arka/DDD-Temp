export const pick = (obj, keys) => {
  const picked = {};
  keys.forEach((key) => {
    if (key in obj) {
      picked[key] = obj[key];
    }
  });
  return picked;
};

export const omit = (obj, keys) => {
  const omitted = { ...obj };
  keys.forEach((key) => {
    delete omitted[key];
  });
  return omitted;
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export const flattenObject = (obj, prefix = "") => {
  const flattened = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
};
