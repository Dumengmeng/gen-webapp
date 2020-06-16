const colors = require('colors');
const Util = require('./utils');
const ora = require('ora');
const fs = require('fs')
const readlineSync = require('readline-sync');
const { execSync } = require('child_process');

const defaultRejistry = 'http://registry.npm.alibaba-inc.com/'

const Main = {

    init({ name, url, usedefault, type, path }) {
        this.appName = name;
        this.destDir = path ? path : `${process.cwd()}/${this.appName}`

        if (url != null) {
            this.repositoryUrl = url
        } else if (usedefault != null || type != null) {
            this.repositoryUrl = Util.getTemplate(type).url;
        } else {
            this.showTypeList();
        }
        this.create();
    },

    showTypeList() {
        const type = readlineSync.keyInSelect(Util.getTemplateTypeList(), colors.green('Choose your template type：'));
        if (type == -1) process.exit(0)
        this.repositoryUrl = Util.templateList[type].url;
    },

    create() {
        if (!this.repositoryUrl) {
            console.log('Repository url is empty!');
            process.exit(0);
        }
        let spinning = null
        try {
            // 克隆文件
            spinning = ora('Loading repository...').start();
            console.log();
            execSync(`git clone ${this.repositoryUrl} ${this.destDir}`)
            Util.delDir(`${this.destDir}/.git`)
            spinning.stop()

            // 修改配置
            const pkgPath = `${this.destDir}/package.json`
            const pckObj = require(pkgPath)
            pckObj.name = this.appName
            fs.writeFileSync(pkgPath, JSON.stringify(pckObj, null, '\t'))
            
            // 安装npm包
            spinning = ora('Install package...').start()
            execSync(`cd ${this.appName} && npm install --registry ${defaultRejistry}`)
            spinning.succeed("Done, you can run ' npm start ' to start your project !");
        } catch (err) {
            console.log(err);
            spinning.fail('Failed!');
        }
    },
};
module.exports = Main;
