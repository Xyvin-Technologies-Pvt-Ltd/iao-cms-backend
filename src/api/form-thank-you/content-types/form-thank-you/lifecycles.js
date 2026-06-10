'use strict';

const UID = 'api::form-thank-you.form-thank-you';

async function assertUniqueKind(strapi, kind, documentId) {
  if (!kind) return;

  const existing = await strapi.db.query(UID).findMany({
    where: { kind },
    select: ['documentId'],
  });

  const documentIds = [...new Set(existing.map((entry) => entry.documentId))];
  const duplicate = documentIds.find((id) => id !== documentId);

  if (duplicate) {
    throw new Error(
      `A Form Thank You entry with kind "${kind}" already exists. Add a locale to the existing entry instead of creating a new one.`
    );
  }
}

module.exports = {
  async beforeCreate(event) {
    const kind = event.params.data?.kind;
    await assertUniqueKind(strapi, kind, null);
  },

  async beforeUpdate(event) {
    const kind = event.params.data?.kind;
    const documentId = event.params.documentId;
    if (!kind || !documentId) return;
    await assertUniqueKind(strapi, kind, documentId);
  },
};
