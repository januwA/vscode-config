const fs = require("fs-extra");
const path = require("path");

const CONFIGPATH = path.resolve(__dirname, "../", "config", "config.json");

class Config {
  static checkConfigFile() {
    if (!fs.existsSync(CONFIGPATH)) {
      fs.writeFile(CONFIGPATH, "{}");
    }
  }

  /**
   * 配置文件保存目录
   */
  static configPath = CONFIGPATH;

  /**
   * 获取配置的githubToken
   */
  static get githubToken() {
    return fs.readJsonSync(Config.configPath).githubToken;
  }
  /**
   * 获取配置的gistId
   */
  static get gistId() {
    return fs.readJsonSync(Config.configPath).gistId;
  }

  static get gistFileName() {
    return fs.readJsonSync(Config.configPath).gistFileName;
  }

  /**
   * 配置是否正确
   */
  static get configOk() {
    const c = fs.readJsonSync(Config.configPath);
    if (c && c.githubToken && c.gistId && c.gistFileName) {
      return true;
    } else {
      console.error(`没有读取到配置 请看 vc config -h`);
      return false;
    }
  }

  /**
   * 设置GithubToken
   * @param {string} token
   */
  static async setGithubToken(token) {
    try {
      const json = await fs.readJson(Config.configPath);
      json.githubToken = token;
      await fs.writeJson(Config.configPath, json);
      console.log("success!");
    } catch (error) {
      console.error(errot);
    }
  }

  /**
   * 设置gistFileName
   * @param {string} token
   */
  static async setGistFileName(name) {
    try {
      const json = await fs.readJson(Config.configPath);
      json.gistFileName = name;
      await fs.writeJson(Config.configPath, json);
      console.log("success!");
    } catch (error) {
      console.error(errot);
    }
  }

  /**
   * 设置GistId
   * @param {string} id
   */
  static async setGistId(id) {
    try {
      const json = await fs.readJson(Config.configPath);
      json.gistId = id;
      await fs.writeJson(Config.configPath, json);
      console.log("success!");
    } catch (error) {
      console.error(errot);
    }
  }

  /**
   * 显示配置列表
   */
  static async show() {
    console.log(await fs.readJson(Config.configPath));
  }
}

module.exports = Config;
