'use strict';
// Arrêter Node-RED avant de modifier son fichier de données.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const destination = process.argv[2];
if (!destination) throw Error('Usage : node restore-project.cjs /chemin/patchwork/data/patchwork.json');
const bundle = JSON.parse(fs.readFileSync(path.join(__dirname, 'project.json'), 'utf8'));
const state = JSON.parse(fs.readFileSync(destination, 'utf8'));
if (state.version !== 2) throw Error('Démarrez une fois la version de Patchwork avec projets avant la restauration.');
fs.copyFileSync(destination, destination + '.backup-' + Date.now(), fs.constants.COPYFILE_EXCL);
const project = bundle.project; project.id = crypto.randomUUID(); project.revision = 1;
project.links = project.links.map(link => ({ ...link, id: crypto.randomUUID(), projectId: project.id }));
state.projects[project.id] = project;
for (const key of ['registry', 'virtuals', 'zigbee']) for (const [id, value] of Object.entries(bundle[key])) if (!state[key][id]) state[key][id] = value;
fs.writeFileSync(destination + '.tmp', JSON.stringify(state, null, 2), { mode: 0o600 });
fs.renameSync(destination + '.tmp', destination);
console.log('Projet restauré, inactif : ' + project.name + '. Redémarrez Node-RED et activez-le dans Patchwork.');
