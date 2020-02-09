const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const CONFIGPATH = path.join(os.homedir(), ".vc.config.json");
const DEFAULT_CONFIG = JSON.stringify(
  {
    githubToken: "",
    gistId: "",
    gistFileName: "c.json5"
  },
  null,
  "  "
);

class Config {
  static checkConfigFile() {
    if (!fs.existsSync(CONFIGPATH)) {
      fs.writeFile(CONFIGPATH, DEFAULT_CONFIG);
    }
  }

  static reset() {
    fs.writeFile(CONFIGPATH, DEFAULT_CONFIG);
  }

  /**
   * 配置文件保存目录
   */
  static configPath = CONFIGPATH;

  /**
   * 获取配置的githubToken
   */
  static get githubToken() {
    return fs.readJsonSync(Config.configPath).githubToken.trim();
  }
  /**
   * 获取配置的gistId
   */
  static get gistId() {
    return fs.readJsonSync(Config.configPath).gistId.trim();
  }

  static get gistFileName() {
    return fs.readJsonSync(Config.configPath).gistFileName.trim();
  }

  /**
   * 配置是否正确
   */
  static get configOk() {
    const c = fs.readJsonSync(Config.configPath);
    if (c && c.githubToken.trim() && c.gistId.trim() && c.gistFileName.trim()) {
      return true;
    } else {
      console.error(`没有读取到配置 请看 vc config -h`);
      return false;
    }
  }

  /**
   * 设置GithubToken
   * @param {string} githubToken
   */
  static async setGithubToken(githubToken) {
    try {
      const json = await fs.readJson(Config.configPath);
      json.githubToken = githubToken.trim();
      await fs.writeJson(Config.configPath, json);
      console.log("success!");
    } catch (error) {
      console.error(errot);
    }
  }

  /**
   * 设置gistFileName
   * @param {string} gistFileName
   */
  static async setGistFileName(gistFileName) {
    try {
      const json = await fs.readJson(Config.configPath);
      json.gistFileName = gistFileName.trim();
      await fs.writeJson(Config.configPath, json);
      console.log("success!");
    } catch (error) {
      console.error(errot);
    }
  }

  /**
   * 设置GistId
   * @param {string} gistId
   */
  static async setGistId(gistId) {
    try {
      const json = await fs.readJson(Config.configPath);
      json.gistId = gistId.trim();
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
