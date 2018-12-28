var { transform } = require('babel-core'),
    // vueLoader = require('vue-loader'), 
    webpack = require('webpack'),
    path = require('path'),
    buble = require('buble'),
    fs = require('fs'),
    _ = require('lodash'),
    I18nPlugin = require('../index'),
    vueTmpCompile = require('vue-template-compiler');

// let { VueLoaderPlugin } = vueLoader;


// let {code} = transformSync('var a ="（支持jpg、png格式，尺寸为1080p*1660px，图片大小不超过1M）"',{
//     plugins:[
//         [I18nPlugin]
//     ]
// });

// let {code} = transformSync('var a =`${this.model.get("name")}  预览`',{
//     plugins:[
//         [I18nPlugin]
//     ]
// });

let { code } = transform(`let a = ('  ' +'预览');`,{
    plugins:[
        [I18nPlugin,{
            outPutInfo:'./i18n/test/2.txt'
        }]
    ]
})

console.log(code);

// let compile = webpack({
//     mode: 'development',
//     entry:'./code.vue',
//     output:{
//         path:__dirname,
//         filename:'test.bundle.js'
//     },
//     module:{
//         rules:[
//             {
//               test: /\.vue$/,
//               loader: [{
//                   loader:'vue-loader',
//                   options:{
//                     compiler:require('./index').getCompile(vueTmpCompile),
//                     compilerOptions:{
//                         directives:{
//                             i18n(el,attrs){
//                                 return $t('共{{useCount}}人，',{data:{useCount},plural:'useCount'}) + 
//                                 $t('有{{html[0][0]}}冲突员工{{notUseMemCount}}人{{html[0][1]}}',{ data: {notUseMemCount, html:[['<span class="red-color">','/span']]} })+
//                                 $t('点击{{html[0][0]}}查看详情${{html[0][1]}}', { data:{html:[['<a href="javascript:;" @click="lookDetail">','</a>']]}})
//                             }
//                         }
//                     }
//                   }
//               }]
//             },{
//                 test:/.js$/,
//                 loader:[{
//                     loader:'babel-loader',
//                     options:{
//                         plugins:[
//                             [require('./index'),{
//                                 "outPutInfo":"./tet.txt"
//                             }],
//                             'transform-remove-strict-mode'
//                         ]
//                     }
//                 }]
//             },
//             {
//             test: /\.css$/,
//             use: [
//                 'vue-style-loader',
//                 'css-loader'
//             ]
//         }]
//     },
//     plugins:[
//         new VueLoaderPlugin()
//     ],
//     devtool:'none'
// });

// let run = function(){
//     compile.run((err,stats) => {
//         if(err) throw err;
//         process.exit(0);
//     });
// }

// let {  compile: testComp } = I18nPlugin.getCompile(vueTmpCompile);

// let data = testComp(` <div class="appsetting-start-up">
// <div class="start-caption">
//     <h2>{{title}}</h2>
// </div>
// <div class="start-up-content">
//     <div class="start-up-pic" v-loading="isLoading">
//         <AppImg
//             class="start-img"
//             v-show="!isDefaultImg"
//             :imgSrc="startUpImgUrl"
//             @imgLoad="imgLoad"
//             @imgError="imgError"
//         />
//         <!--<img :src="startUpImgUrl" alt="" class="start-img" @load="imgLoad" @error="imgError" v-show="!isDefaultImg">-->
//         <div class="handle-box" v-show="showHandleBox">
//             <span class="handle-item handle-update" @click.stop="updateImg">更改</span>
//             <UpLoader
//                 ref="inputFile"
//                 :filter="filter"
//                 @success="uploadSuccess"
//                 @select="selectImg"
//             >
//             </UpLoader>
//             <span class="handle-item handle-del" v-show="!isDefaultImg" @click="delImg">删除</span>
//         </div>
//     </div>
//     <div class="describe">
//         <p>（支持jpg、png格式，尺寸为1080p*1660px，图片大小不超过1M）</p>
//         <p>你好</p>
//     </div>
// </div>
// </div>`,{
//     directives:{
//         i18n(el,attrs){
//             console.log(el);
//             // el.children.length = 0;
//             let data = parseNode(el);
//             // el.oldChildren = el.children;
//             // el.children = [];
//             // el.model = {
//             //     value:'',
//             // };
//             el.children = [];
//             el.wrapData = (code) => {
//                 return `{directives:[{name:"i18n",rawName:"v-i18n",expression:"${data.replace(/\n/g,'')}"}]}`;
//             }
//             return true;
//         }
//     }
// })

// function parseNode(node){
//     let { type } = node; // 1 div 标签， 2 计算表达式 3 纯文本
//     if(type === 1){
//         return node.children.map((v) => parseNode(v)).join('')
//     }
//     if(type == 2){
//         return node.tokens.map(v => {
//             if( _.isObject(v) ){
//                 return `{{${v['@binding']}}}`;
//             }else{
//                 return v;
//             }
//         }).join('');
//     }
//     if(type == 3){
//         return node.text;
//     }
// }

// console.log(data);


// compile.run((err,stats) => {
//     if(err) throw err;
//     process.exit(0);
// });

// global.testRun = run;

// run();

