const { transform } =  require('babel-core');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const log4js = require('log4js');
log4js.configure(require('./log4js.config'));
const Log = log4js.getLogger('cheese');
Log.level = 'info';

function hasChines(str = ''){
    return /^[\w\-\_\s（]*[\u4e00-\u9fa5\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]+[\u4e00-\u9fa5\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5\-\_\w\-\_\s\:：；）]*/.test(str);
}

function exportInfo(v = [],outPut){
    let exInfos = [];
    v.forEach(({positions,title}) => {
        exInfos.push(`${title} ${positions.length} ${positions.map(d => JSON.stringify(d)).join(' ')}`);
    });
    Log.info(exInfos);

    let _path = path.join(outPut);
    var _tmp = _path.split('/');
    var _tmpPath = '';
    // var i = _tmp.length - 1;
    var i = 0;
    do{
        _tmpPath += _tmpPath ? '/' + _tmp[i] : _tmp[i];
        if(!fs.existsSync(path.join(_tmpPath))){
            fs.mkdirSync(path.join(_tmpPath));
        }
    }while(++i < _tmp.length -1);

    fs.writeFileSync(path.join(outPut),exInfos.join('\n'));
}

let info = new Map();

let first = true;

const I18nPlugin = function ({ types: t }) {
    return {
        visitor:{
            Program:{
                enter(path,state){
                    // info.clear();
                },
                exit(path,state = { opts:{} }){
                    let { opts : { outPutInfo = '' } } = state;
                    // console.log(state.opts);
                    // console.log(outPutInfo);
                    if(outPutInfo){
                        exportInfo(info,outPutInfo);
                    }
                }
            },
            StringLiteral(path,state = {}){
                let node = path.node;
                let value = path.node.value;
                try{
                    hasChines(value);
                }catch(e){
                    if(first){
                        // console.error('node',path.node);
                        // console.error('value',path.node.value);
                        Log.error(path.node);
                        Log.error(path.node.value);
                        console.error(path.node.value);
                    }                
                    first = false;
                    throw path;
                }
                if(hasChines(value)){
                    if(info.has(value)){
                        let data = info.get(value);
                        data.positions.push({
                            loc: node.loc,
                            fileName: state.file.opts.fileName
                        });
                    }else{
                        info.set(value,{
                            title:value,
                            positions:[{
                                loc: node.loc,
                                fileName: state.file.opts.fileName
                            }]
                        })
                    }
                    let parentNode = path.parentPath;
                    if(parentNode && t.isBinaryExpression(parentNode)){
                        let {left,right, operator} = parentNode.node;
                        if(
                            (t.isIdentifier(left) || t.isStringLiteral(left)) && 
                            (t.isIdentifier(right) || t.isStringLiteral(right)) 
                        ){
                            let _left = left; 
                            let _right = right;
                            if(t.isStringLiteral(left) && hasChines(left.value)){
                                // console.log(1);
                                _left = t.CallExpression(t.identifier('$t'),[left]);
                            }
                            if(t.isStringLiteral(right) && hasChines(right.value)){
                                // console.log(2);
                                _right = t.CallExpression(t.identifier('$t'),[right]);
                            }
                            if(_left === left && _right === right){
                                // parentNode.skip();
                                return;
                            }
                            parentNode.replaceWith(t.binaryExpression(
                                operator,
                                _left,
                                _right
                            ));
                            return;
                        }
                        return;
                    }

                    if(parentNode && t.isCallExpression(path.parent)){
                        let _node = path.parent,
                            callee = _node.callee;
                        if(t.isIdentifier(callee) && callee.name == '$t'){
                            return;
                        }
                    }
                    path.replaceWith(t.CallExpression(t.identifier('$t'),[node]))
                    path.skip();
                }
            },
            // // 字符串模板变量
            // TaggedTemplateExpression(path,state = {}){
            // }
        }
    }
}

function parseNode(node,data){
    let { type } = node; // 1 div 标签， 2 计算表达式 3 纯文本
    if(type === 1){
        data.html || (data.html = []);
        let len = data.html.length;
        data.html.push([`_c(${node})`]);
        return  `{{html[${len}][0]}}` + node.children.map((v) => parseNode(v,data)).join('') + ('');
    }
    if(type == 2){
        return node.tokens.map(v => {
            if( _.isObject(v) ){
                data[v['@binding']] = v['@binding'];
                return `{{${v['@binding']}}}`;
            }else{
                return v;
            }
        }).join('');
    }
    if(type == 3){
        return node.text;
    }
}

const parseVueTmp = function(content = ''){
    // content = content.replace(/^with\(this\)\{(.*)?\}$/,'$1');
    // console.log(content);
    let d = transform(content,{
        plugins:[
            [
                I18nPlugin
            ]
        ],
        parserOpts:{
            allowReturnOutsideFunction: true,
            strictMode:false
        }
    });
    // console.log(d.code);
    return d.code;
    // let newCode = d.code;
    // // newCode = newCode.replace(/function a\(\) \{(.*)?\}/g,'with(this){$1}');
    // newCode = `with(this){${newCode}}`;
    // render = newCode;
    // console.log('newCode',render);
}
I18nPlugin.getCompile = function(vueTmpCompile){ // vue template 上传
    let compile = vueTmpCompile.compile;
    vueTmpCompile.compile = function(code,options){
        // console.log(options);
        // console.log(code);
        let { render, ast, staticRenderFns, errors } = compile(code,Object.assign(options,{
            directives:{
                i18n(el,attrs){
                    // console.log(el);
                    // el.children.length = 0;
                    let expressionData = {}
                    let data = parseNode(el,expressionData);
                    // el.oldChildren = el.children;
                    // el.children = [];
                    // el.model = {
                    //     value:'',
                    // };
                    // el.children = [];
                    let children = el.children.concat();
                    el.children.length = 0;
                    el.wrapData = (code) => {
                        return `{directives:[{name:"i18n",rawName:"v-i18n",expression:"${data.replace(/\n/g,'')}",expressionData:${expressionData}}]}`;
                    }
                    // el.attrs['i18n'] = data;
                    return true;
                }
            }
        }));

        // console.log(staticRenderFns);

        [render,...staticRenderFns] = [render,...staticRenderFns].map(parseVueTmp);

        // console.log('end',staticRenderFns);
        
        return {
            render,
            ast,
            staticRenderFns,
            errors
        }
    }
    return vueTmpCompile;
}
module.exports = I18nPlugin;

