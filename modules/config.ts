import { error, info } from "./console";
import { writeFile } from "fs/promises";
import { access, constants, readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";

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

export default readConfig;
export {checkConfig, readConfig, configPath};
