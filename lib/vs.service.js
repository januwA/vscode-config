// const path = require("path");
const shell = require("shelljs");
const fs = require("fs-extra");
const ora = require("ora");
const JSON5 = require("json5");

const Config = require("./config");
const createHttp = require("./create-http");
const PlatForm = require("./platform");

class VCService {
  /**
   * 拉取gist上的配置
   */
  async pull() {
    try {
      const getConfigSpinners = ora("Get Gist Config").start();
      const { data } = await createHttp().get(`/gists/${Config.gistId}`);
      const content = data.files[Config.gistFileName].content;
      const userVscodeConfig = JSON5.parse(content);
      if (userVscodeConfig) {
        getConfigSpinners.succeed("Get Gist Config Success");
        const { extensions, settings } = userVscodeConfig;
        setTimeout(() => {
          Promise.all(extensions.map(this._installExtension)).then(() =>
            ora("Installation Complete").succeed()
          );
        });

        try {
          const setSettingJsonSpinners = ora("Setting setting.json").start();
          await this._setSettings(JSON.stringify(settings, null, "  "));
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
  /**
   * 将本地配置发送到gist
   */
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
        const content = JSON5.stringify(userVscodeConfig, null, "  ");
        await createHttp()({
          url: "/gists/" + Config.gistId.trim(),
          method: "PATCH",
          data: {
            files: {
              [Config.gistFileName]: { content }
            }
          }
        });

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
   * 安装插件
   * @param {string} extension  插件id
   */
  _installExtension(extension) {
    return new Promise(res => {
      if (!extension.trim()) {
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
