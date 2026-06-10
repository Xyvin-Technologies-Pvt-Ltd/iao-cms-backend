'use strict';

/**
 * Content types the Next.js frontend reads without auth (Public role: find, findOne).
 * Add a UID here when a new type needs the same bootstrap permissions.
 */
const PUBLIC_READ_UIDS = [
  'api::site-footer.site-footer',
  'api::programme-lecturers-page.programme-lecturers-page',
  'api::free-hospitation-page.free-hospitation-page',
  'api::registration-form-pages.registration-form-page',
  'api::team-iao-page.team-iao-page',
];

const ACTIONS_BY_ROLE = {
  public: ['find', 'findOne'],
  authenticated: ['find', 'findOne', 'create', 'update', 'delete'],
};

function actionsForUid(uid, roleType) {
  return (ACTIONS_BY_ROLE[roleType] || []).map((action) => `${uid}.${action}`);
}

/**
 * Idempotently grants Users & Permissions actions for one content type UID.
 */
async function ensurePublicReadPermissions(strapi, uid) {
  const roles = await strapi.db.query('plugin::users-permissions.role').findMany({
    where: { type: { $in: Object.keys(ACTIONS_BY_ROLE) } },
  });

  let created = 0;

  for (const role of roles) {
    const actions = actionsForUid(uid, role.type);
    if (!actions.length) continue;

    for (const action of actions) {
      const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: { action, role: role.id },
      });
      if (existing) continue;

      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      });
      created += 1;
      strapi.log.info(`[permissions] ${role.type}: ${action}`);
    }
  }

  return created;
}

async function ensureAllPublicContentPermissions(strapi) {
  let created = 0;
  for (const uid of PUBLIC_READ_UIDS) {
    created += await ensurePublicReadPermissions(strapi, uid);
  }
  return created;
}

module.exports = {
  PUBLIC_READ_UIDS,
  ACTIONS_BY_ROLE,
  ensurePublicReadPermissions,
  ensureAllPublicContentPermissions,
};
