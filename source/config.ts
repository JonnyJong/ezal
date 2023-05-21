import { error, info } from "./console";
import { writeFile } from "fs/promises";
import { access, constants, readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";

const defaultConfig = `theme: default`

const configPath = path.join(process.cwd(), 'config.yml');

function checkConfig() {
  return access(configPath, constants.R_OK).catch(()=>{
    info('Could not access config.yml, trying to create config.yml.');
    return writeFile(configPath, '', 'utf8');
  }).catch(()=>{
    throw 'Could not create config.yml.';
  });
}

function readConfig() {
  return readFile(configPath, 'utf-8').catch(()=>{
    error('Could not read config.yml.');
    return '';
  }).then(parse).catch((err)=>{
    error(err, 'Cannot parse config.yml.');
    return {}
  });
}

async function checkThemeConfig(themeName: string) {
  let themeDefaultConfigPath = path.join(process.cwd(), 'themes', themeName, 'config.yml');
  let themeUserConfigPath = path.join(process.cwd(), themeName + '.config.yml');
  let themeConfigAccessabled = await access(themeDefaultConfigPath, constants.R_OK).then(()=>true,()=>false);
  if (!themeConfigAccessabled) return;
  return access(themeUserConfigPath)
  .catch(async ()=>writeFile(themeUserConfigPath, await readFile(themeDefaultConfigPath, 'utf-8'), 'utf-8'))
  .catch(()=>{
    throw `Could not create ${themeName}.config.yml.`;
  });
}

async function readThemeConfig(themeName: string) {
  return Object.assign(
    parse(await readFile(path.join(process.cwd(), 'themes', themeName, 'config.yml'), 'utf8')),
    parse(await readFile(path.join(process.cwd(), themeName + '.config.yml'), 'utf8'))
  );
}

export default readConfig;
export {checkConfig, readConfig, configPath, defaultConfig, checkThemeConfig, readThemeConfig};
