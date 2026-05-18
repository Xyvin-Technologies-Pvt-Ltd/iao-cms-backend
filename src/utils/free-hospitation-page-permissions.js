'use strict';

const UID = 'api::free-hospitation-page.free-hospitation-page';

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
 * Idempotently grants Users & Permissions actions for free-hospitation-page.
 */
async function ensureFreeHospitationPagePermissions(strapi) {
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

module.exports = { ensureFreeHospitationPagePermissions, ACTIONS_BY_ROLE, UID };
