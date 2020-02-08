// const path = require("path");
const shell = require("shelljs");
const fs = require("fs-extra");
const ora = require("ora");
const JSON5 = require("json5");

const Config = require("./config");
const createHttp = require("./create-http");
const PlatForm = require("./platform");

/**
 * 安装[extension]
 * @param {string} extension
 */
function installExtension(extension) {
  return new Promise(res => {
    if (!extension) {
      res();
      return;
    }
    const { code } = shell.exec(`code --install-extension ${extension}`);
    if (code !== 0) {
      console.log("\r");
      shell.exit(1);
    }
    res();
  });
}

class VCService {
  async pull() {
    try {
      const getConfigSpinners = ora("Get Gist Config").start();
      const userVscodeConfig = await this._getUserVscodeConfig();
      if (userVscodeConfig) {
        getConfigSpinners.succeed("Get Gist Config Success");
        setTimeout(() => {
          Promise.all(userVscodeConfig.extensions.map(installExtension)).then(
            () => {
              ora("Installation Complete").succeed();
            }
          );
        });

        try {
          const setSettingJsonSpinners = ora("Setting setting.json").start();
          await this._setSettings(
            JSON.stringify(userVscodeConfig.settings, null, "  ")
          );
          setSettingJsonSpinners.succeed();
        } catch (error) {
          setSettingJsonSpinners.fail();
          throw error;
        }
      } else {
        getConfigSpinners.fail();
        throw new Error(`gist并没有push配置 如果继续设置您本地配置将被清空!!`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async push() {
    const getLocalConfigSpinners = ora("get local config").start();
    try {
      const userVscodeConfig = {
        settings: await this._getSettings(),
        extensions: await this._getExtensions()
      };
      getLocalConfigSpinners.succeed();
      const pushSpinners = ora("Push").start();
      try {
        const contexnt = JSON5.stringify(userVscodeConfig, null, "  ");
        await this._pushConfig(contexnt);
        pushSpinners.succeed();
      } catch (error) {
        pushSpinners.fail();
        console.error(error);
      }
    } catch (error) {
      getLocalConfigSpinners.fail();
    }
  }

  /**
   * 将配置发送到gist
   * @param {string} content
   */
  async _pushConfig(content) {
    return createHttp()({
      url: "/gists/" + Config.gistId,
      method: "PATCH",
      data: {
        files: {
          [Config.gistFileName]: { content }
        }
      }
    });
  }

  /**
   * 获取gist上的配置
   *
   * @result { Promise<{settings: {}, extensions: []}> }
   */
  async _getUserVscodeConfig() {
    try {
      const http = createHttp();
      const { data } = await http.get(`/gists/${Config.gistId}`);
      const userVscodeConfig = JSON5.parse(
        data.files[Config.gistFileName].content
      );
      return userVscodeConfig;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 设置本地setting.json
   * @param {string} jsonString
   */
  async _setSettings(jsonString) {
    const fp = PlatForm.getSettinsPath();
    if (fs.existsSync(fp)) {
      await fs.outputFile(fp, jsonString);
    }
  }

  /**
   * 获取本地的setting.json
   * @result { Promise<{}> }
   */
  async _getSettings() {
    const fp = PlatForm.getSettinsPath();
    if (fs.existsSync(fp)) {
      return JSON5.parse(await fs.readFile(fp, "utf8"));
    } else {
      throw new Error(`settings.json 文件没找到，或则不存在.`);
    }
  }

  /**
   * 获取本地的插件列表
   * @result { string[] }
   */
  async _getExtensions() {
    // 使用code命令获取插件列表
    const r = shell.exec(`code --list-extensions`, { silent: true }).stdout;
    if (r) {
      return r
        .split(/\n/)
        .map(e => e.trim())
        .filter(e => !!e);
    } else {
      return [];
    }

    // 通过读取本地文件，来获取插件列表
    // 注: 如果删除了插件，但是本地没有删除文件，还是会读取

    // const extensionsDir = PlatForm.getExtentionsPath();
    // if (fs.existsSync(extensionsDir)) {
    //   let extensions = await fs.readdir(extensionsDir);
    //   extensions = extensions
    //     .filter(s => !s.startsWith(".")) // 砍掉隐藏文件
    //     .filter(s => fs.lstatSync(path.join(extensionsDir, s)).isDirectory()) // 只要目录
    //     .map(s => s.replace(/(?:-\d+\.\d+\.\d+)$/g, "")); // 砍掉vsersion
    //   return Array.from(new Set(extensions)); // 去重
    // } else {
    //   throw new Error(`插件安装目录没有找到.`);
    // }
  }
}

module.exports = new VCService();
