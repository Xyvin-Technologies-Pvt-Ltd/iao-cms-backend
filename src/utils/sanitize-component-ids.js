'use strict';

/**
 * Strip component `id` values that are not linked to the parent entity row.
 * Works around Strapi 5 draft/publish mismatches for nested repeatable components.
 */

function stripNestedComponentIds(strapi, uid, data) {
  const schema = strapi.getModel(uid);
  if (!schema?.attributes || !data || typeof data !== 'object') {
    return data;
  }

  const result = { ...data };

  for (const [attrName, attribute] of Object.entries(schema.attributes)) {
    if (attribute.type !== 'component' || !(attrName in result)) {
      continue;
    }

    const nestedUid = attribute.component;

    if (attribute.repeatable) {
      if (!Array.isArray(result[attrName])) {
        continue;
      }
      result[attrName] = result[attrName].map((item) => {
        if (!item || typeof item !== 'object') {
          return item;
        }
        const { id: _id, ...rest } = item;
        return stripNestedComponentIds(strapi, nestedUid, rest);
      });
      continue;
    }

    const value = result[attrName];
    if (value && typeof value === 'object') {
      const { id: _id, ...rest } = value;
      result[attrName] = stripNestedComponentIds(strapi, nestedUid, rest);
    }
  }

  return result;
}

async function sanitizeRepeatableComponents(strapi, parentUid, parentEntityId, attrName, componentUid, items) {
  if (!Array.isArray(items)) {
    return items;
  }

  const previousValue = await loadLinkedComponents(strapi, parentUid, parentEntityId, attrName);
  const validIds = new Set(
    (Array.isArray(previousValue) ? previousValue : [])
      .filter((entry) => entry?.id != null)
      .map((entry) => String(entry.id))
  );

  return Promise.all(
    items.map(async (item) => {
      if (!item || typeof item !== 'object') {
        return item;
      }

      let next = { ...item };
      const hasValidId = next.id != null && validIds.has(String(next.id));

      if (next.id != null && !hasValidId) {
        const { id: _id, ...rest } = next;
        next = stripNestedComponentIds(strapi, componentUid, rest);
      } else if (hasValidId) {
        next = await sanitizeComponentIds(strapi, componentUid, next.id, next);
      }

      return next;
    })
  );
}

async function sanitizeSingleComponent(strapi, parentUid, parentEntityId, attrName, componentUid, value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const previousValue = await loadLinkedComponents(strapi, parentUid, parentEntityId, attrName);
  const component = Array.isArray(previousValue) ? previousValue[0] : previousValue;
  const validId = component?.id != null ? String(component.id) : null;

  let next = { ...value };
  const hasValidId = next.id != null && validId === String(next.id);

  if (next.id != null && !hasValidId) {
    const { id: _id, ...rest } = next;
    next = stripNestedComponentIds(strapi, componentUid, rest);
  } else if (hasValidId) {
    next = await sanitizeComponentIds(strapi, componentUid, next.id, next);
  }

  return next;
}

async function sanitizeComponentIds(strapi, parentUid, parentEntityId, data) {
  const schema = strapi.getModel(parentUid);
  if (!schema?.attributes || !data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };

  for (const [attrName, attribute] of Object.entries(schema.attributes)) {
    if (attribute.type !== 'component' || !(attrName in sanitized)) {
      continue;
    }

    const componentUid = attribute.component;
    const value = sanitized[attrName];

    if (value == null) {
      continue;
    }

    if (attribute.repeatable) {
      sanitized[attrName] = await sanitizeRepeatableComponents(
        strapi,
        parentUid,
        parentEntityId,
        attrName,
        componentUid,
        value
      );
    } else {
      sanitized[attrName] = await sanitizeSingleComponent(
        strapi,
        parentUid,
        parentEntityId,
        attrName,
        componentUid,
        value
      );
    }
  }

  return sanitized;
}

async function loadLinkedComponents(strapi, parentUid, parentEntityId, attrName) {
  return strapi.db.query(parentUid).load({ id: parentEntityId }, attrName);
}

async function findDraftEntryId(strapi, uid, { documentId, locale }) {
  if (!documentId) {
    return null;
  }

  const where = {
    documentId,
    publishedAt: { $null: true },
  };

  if (locale) {
    where.locale = locale;
  }

  const entry = await strapi.db.query(uid).findOne({
    where,
    select: ['id'],
  });

  return entry?.id ?? null;
}

function registerComponentIdSanitizer(strapi, uids) {
  const targetUids = new Set(uids);

  strapi.documents.use(async (context, next) => {
    if (!targetUids.has(context.uid)) {
      return next();
    }

    if (context.action !== 'update' || !context.params?.data) {
      return next();
    }

    const locale = context.params.locale ?? context.params.data?.locale;
    const entryId = await findDraftEntryId(strapi, context.uid, {
      documentId: context.params.documentId,
      locale,
    });

    if (!entryId) {
      return next();
    }

    context.params.data = await sanitizeComponentIds(
      strapi,
      context.uid,
      entryId,
      context.params.data
    );

    return next();
  });
}

module.exports = {
  sanitizeComponentIds,
  registerComponentIdSanitizer,
};
