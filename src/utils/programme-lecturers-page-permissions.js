'use strict';

const UID = 'api::programme-lecturers-page.programme-lecturers-page';

const ACTIONS_BY_ROLE = {
  public: [`${UID}.find`, `${UID}.findOne`],
  authenticated: [
    `${UID}.find`,
    `${UID}.findOne`,
    `${UID}.create`,
    `${UID}.update`,
    `${UID}.delete`,
  ],
};

/**
 * Idempotently grants Users & Permissions actions for programme-lecturers-page.
 * Public: find, findOne (published entries only at query time via status=published).
 */
async function ensureProgrammeLecturersPagePermissions(strapi) {
  const roles = await strapi.db.query('plugin::users-permissions.role').findMany({
    where: { type: { $in: Object.keys(ACTIONS_BY_ROLE) } },
  });

  let created = 0;

  for (const role of roles) {
    const actions = ACTIONS_BY_ROLE[role.type];
    if (!actions?.length) continue;

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

module.exports = { ensureProgrammeLecturersPagePermissions, ACTIONS_BY_ROLE, UID };
