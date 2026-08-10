const fs = require('fs');
const path = require('path');

if (!process.env.CI) {
  require('dotenv').config();
}

const envFiles = [
  'environment.ts',
  'environment.development.ts',
  'environment.production.ts',
];

for (const fileName of envFiles) {
  const targetPath = path.resolve(__dirname, `./src/environments/${fileName}`);
  if (!fs.existsSync(targetPath)) continue;

  let fileContent = fs.readFileSync(targetPath, { encoding: 'utf8' });

  const replacements = {
    CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY,
    MAIN_BACKEND: process.env.MAIN_BACKEND,
    GESTOR_DOCUMENTAL: process.env.GESTOR_DOCUMENTAL,
    AUTENTICACION_MID: process.env.AUTENTICACION_MID,
    PRUEBAS_ASSETS: process.env.PRUEBAS_ASSETS,
  };

  for (const [key, value] of Object.entries(replacements)) {
    if (!value) continue;
    fileContent = fileContent.replace(new RegExp(`${key}:\\s*'[^']*'`, 'g'), `${key}: '${value}'`);
  }

  fs.writeFileSync(targetPath, fileContent, { encoding: 'utf8' });
  console.log(`✅ ${fileName} actualizado con variables disponibles`);
}
