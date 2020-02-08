#!/usr/bin/env node

const yargs = require("yargs");
const Config = require("../lib/config");
const vcService = require("../lib/vs.service");

const { argv } = yargs
  .config({})
  .command("config", "查看或修改配置", function(yargs) {
    return yargs
      .option("token", {
        description: "set github token"
      })
      .option("id", {
        description: "set gist id"
      })
      .option("name", {
        description: "set gist file name"
      })
      .option("list", {
        description: "查看当前配置"
      })
      .help("help");
  })
  .command("pull", "拉取配置")
  .command("push", "上传配置")
  .alias("h", "help")
  .alias("v", "version")
  .help("help");

const { _: ARGV } = argv;

Config.checkConfigFile();
if (ARGV.includes("config")) {
  if (argv.token) {
    Config.setGithubToken(argv.token);
  }

  if (argv.id) {
    Config.setGistId(argv.id);
  }

  if (argv.name) {
    Config.setGistFileName(argv.name);
  }

  if (argv.list) {
    Config.show();
  }
}

if (ARGV.includes("push")) {
  // 收集配置，发送到gist
  if (Config.configOk) {
    vcService.push();
  }
  return;
}
if (ARGV.includes("pull")) {
  // 拉取gist的配置，设置settings.json和安装插件
  vcService.pull();
  return;
}
