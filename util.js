

const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync

const Utils = {

    getType(val) {
        return Object.prototype.toString.call(val)
            .replace('[object ', '')
            .replace(']', '')
            .toLowerCase()
    },

    /* 
        操作package.json文件
        @param url 当前项目路径
        @param key 属性
        @param val 值（不传则为获取key属性，传则为设置key属性）
    */
    packageJSON(url = '', key, val) {
        try {
            const pt = `${url}/package.json`
            if (fs.existsSync(pt)) {
                const jsonObj = JSON.parse(fs.readFileSync(pt))
                if (typeof val === 'undefined') {
                    return jsonObj[key]
                } else {
                    jsonObj[key] = val
                    fs.writeFileSync(pt, JSON.stringify(jsonObj, null, 2))
                }
            }
        } catch(e) {
            console.log(e)
        }
    },

    /* 
        删除文件夹或文件
    */
    deleteAll(path) {
        if(fs.existsSync(path)) {
            execSync(`rm -rf ${path}`, err => {
                if (err) { console.log('remove dir error: ', err) }
            })
        }
    },

    isEmptyDirectory(path) {
        return !fs.readdirSync(path).length
    },

}

module.exports = Utils