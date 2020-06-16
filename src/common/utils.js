const fs = require('fs')

const Utils = {

    templateList: require('./template-list'),
    
    getRepoName() {
        const index = this.repositoryUrl.lastIndexOf('/') + 1
        return this.repositoryUrl.substr(index).split('.')[0]
    },

    getTemplate(type) {
        return this.templateList.filter(item => {
            if (type != null) {
                return type.toLowerCase() === item.type.toLowerCase();
            }
            return item.default;
        })[0] || {};
    },

    getTemplateTypeList() {
        return this.templateList.map(item => item.type) || [];
    },

    delDir(path) {
        let files = [];
        if(fs.existsSync(path)){
            files = fs.readdirSync(path);
            files.forEach((file, index) => {
                let curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()){
                    this.delDir(curPath); 
                } else {
                    fs.unlinkSync(curPath); 
                }
            });
            let ret = fs.rmdirSync(path);
        }
    },

};
module.exports = Utils;
