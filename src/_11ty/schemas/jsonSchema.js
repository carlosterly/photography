// A minimal JSON Schema (draft-07) subset interpreter — not a general-purpose
// engine. Supports exactly the keywords galleries.schema.json uses: type,
// required, properties, additionalProperties (as a schema), items, minLength,
// minProperties, and $ref (resolved against the schema's own "definitions").
// See docs/editing-galleries.md.
"use strict";

function resolveRef(rootSchema, ref) {
  const match = /^#\/definitions\/(.+)$/.exec(ref);
  if (!match) {
    throw new Error(`unsupported $ref: ${ref}`);
  }
  const def = rootSchema.definitions && rootSchema.definitions[match[1]];
  if (!def) {
    throw new Error(`$ref not found: ${ref}`);
  }
  return def;
}

function typeOf(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function matchesType(value, type) {
  if (type === "integer") return Number.isInteger(value);
  return typeOf(value) === type;
}

function validate(rootSchema, schema, value, path, errors) {
  if (schema.$ref) {
    schema = resolveRef(rootSchema, schema.$ref);
  }

  const label = path || "(root)";

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${label}: expected ${schema.type}, got ${typeOf(value)}`);
    return;
  }

  if (schema.type === "string" && typeof schema.minLength === "number") {
    if (value.trim().length < schema.minLength) {
      errors.push(`${label}: string is empty`);
    }
  }

  if (schema.type === "object") {
    if (typeof schema.minProperties === "number" && Object.keys(value).length < schema.minProperties) {
      errors.push(`${label}: expected at least ${schema.minProperties} propert${schema.minProperties === 1 ? "y" : "ies"}`);
    }
    for (const key of schema.required || []) {
      if (!(key in value)) {
        errors.push(`${path ? `${path}.${key}` : key}: required property missing`);
      }
    }
    const knownKeys = new Set(Object.keys(schema.properties || {}));
    for (const [key, propSchema] of Object.entries(schema.properties || {})) {
      if (key in value) {
        validate(rootSchema, propSchema, value[key], path ? `${path}.${key}` : key, errors);
      }
    }
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      for (const [key, propValue] of Object.entries(value)) {
        if (!knownKeys.has(key)) {
          validate(rootSchema, schema.additionalProperties, propValue, path ? `${path}.${key}` : key, errors);
        }
      }
    }
  }

  if (schema.type === "array" && schema.items) {
    value.forEach((item, i) => {
      validate(rootSchema, schema.items, item, `${path || label}[${i}]`, errors);
    });
  }
}

function validateAgainstSchema(schema, data) {
  const errors = [];
  validate(schema, schema, data, "", errors);
  return errors;
}

module.exports = { validateAgainstSchema };
