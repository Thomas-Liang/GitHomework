class Vue{
    constructor(opts){
        this.opts = opts;
        this._data = opts.data;
        this.observe(this._data);
        this.compile();
    }
    // 观察数据
    observe(data){
        let keys = Object.keys(data);
        keys.forEach(key=>{
            let value = data[key]
            let _this = this;
            let dep = new Dep();
            Object.defineProperty(data,key,{
                configurable:true,
                enumerable:true,
                get(){
                    console.log("get...");
                    // 收集订阅者；
                    // dep.addSub(new Watcher(()=>{
                    //     console.log("执行了");
                    // }))
                    if(Dep.target){
                        dep.addSub(Dep.target);
                    }
                    // data[key] ---触发get --- data[key]
                    return value;
                },
                set(newValue){
                    console.log(dep);
                    // 发布；
                    dep.notify(newValue);
                    value = newValue;
                }
            })
        })


    }
    compile(){
        // 作用域；
        let el = document.querySelector(this.opts.el)
        this.compileNodes(el);
    }
    compileNodes(el){
        let childNodes = el.childNodes;
        childNodes.forEach(node=>{
            if(node.nodeType===1){
                // console.log("元素节点")
                let attrs = node.attributes;
                console.log(attrs);
                [...attrs].forEach(attr=>{
                    let attrName = attr.name;
                    let attrValue = attr.value;
                    
                    // console.log(attrName,attrValue);
                    if(attrName==="v-model"){
                        node.value = this._data[attrValue];
                        node.addEventListener("input",e=>{
                            // console.log(e.target.value);
                            // set 过程；
                            this._data[attrValue] = e.target.value;
                            //暗号---空调
                            this.compile();
                        })
                        
                    //暗号---空调
                    }else if(attrName==="v-html"){
                        //console.log(node);
                        node.innerHTML = this._data[attrValue];
                        //document.querySelector(node.nodeName.toLowerCase()).innerHTML = this._data[attrValue];                    
                        //console.log(attrName,attrValue);
                    }
                    
                })



                if(node.childNodes.length>0){
                   this.compileNodes(node);
                }
            }else if(node.nodeType===3){
                // console.log("文本节点");
                // 查找  “{{}}”;{{ message }}
                let reg = /\{\{\s*([^\{\}\s]+)\s*\}\}/g;
                let textContent = node.textContent;
                // console.log(textContent);
               if( reg.test(textContent) ){
                   let $1 = RegExp.$1;
                //    console.log("有大胡子语法",$1);
                    // console.log(this._data[$1]);
                    // 替换模板里的内容
                    node.textContent =  node.textContent.replace(reg,this._data[$1]);
                    
                    // 通过事件名称关联；key === $1(下标：“message”) oldValue值："数据"; 
                    // this.addEventListener($1,e=>{
                    //     // console.log("触发了事件..",e);
                    //     let newValue = e.detail;
                    //     let oldValue = this._data[$1];
                    //     let reg = new RegExp(oldValue,"g");
                    //     node.textContent = node.textContent.replace(reg,newValue);
                    // })

                    // 触发watcher 回调；
                    // 人为触发 get方法 收集watcher
                    new Watcher(this._data,$1,(newValue)=>{
                            //console.log("执行了");
                            // let newValue = e.detail;
                            let oldValue = this._data[$1];
                            let reg = new RegExp(oldValue,"g");
                            node.textContent = node.textContent.replace(reg,newValue);
                    })


               }
            }
        })
    }
}


// 收集器
class Dep{
    constructor(){
        // [watcher,watcher....]
        this.subs = [];
    }
    // 添加订阅者
    addSub(sub){
        this.subs.push(sub);
    }
    // 发布
    notify(newValue){
        this.subs.forEach(sub=>{
            sub.update(newValue);
        }) 
    }
}
// 订阅者；
class Watcher{
    constructor(data,key,cb){
        this.cb = cb;
        Dep.target = this;
        data[key] ;  //触发get方法；
        Dep.target = null;
    }
    update(newValue){
        this.cb(newValue);
    }
}
