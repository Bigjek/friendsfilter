const myHbsRight =  require('../RightList.hbs');
const myHbsLeft = require('../LeftList.hbs');
const myModuleApi = {
    listRight: document.querySelector('.list-user-right'),
    listLeft: document.querySelector('.list-user-left'),
    searchLeft: document.querySelector('.input-user-left'),
    searchRight: document.querySelector('.input-user-right'),
    friendContent: document.querySelector('.filter-block__content'),
    saveList: document.querySelector('.filter-block__save'),
    init: function () {
        let self = this;
        if(!localStorage.dataInfo || localStorage.dataInfo.length < 12){
            localStorage.clear();
            self.authVK()
                .then(()=>{
                    self.api('friends.get', {fields:'photo_100'})
                    .then((self)=>{
                        let item = [];
                        for(let i in self.items){
                            item.push({userName: `${self.items[i].first_name} ${self.items[i].last_name}` , photo: `${self.items[i].photo_100}`})
                        }
                        userListLeft.list = item;
                        myModuleApi.listUpdate(userListLeft, sortingRight);
                    });
                })
        }
    },
    authVK: function() {
        return new Promise((resolve,reject) => {
            VK.init({
                apiId: 6302893
            });
            VK.Auth.login(data => {
                if(data.session){
                    resolve();
                }else {
                    reject(new Error('Не удалось авторизоваться.'));
                }
            },2)
        })
    },
    api: function(method,params) {
        return new Promise((resolve,reject)=>{
            params.v = '5.69';
            VK.api(method,params,(data)=>{
                if(data.error) {
                    reject(data.error)
                }else {
                    resolve(data.response);
                }
            })
        });
    },
    listRightStart : function () {
        return localStorage.dataInfo ? JSON.parse(localStorage.dataInfo) : undefined;
    },
    addU: function(elem,list) {
        list.push(elem)
    },
    deleteU: function(elem,list) {
        for (let i = 0; i < list.length;i++){
            if(list[i].userName === elem) {
                list.splice(i, 1);
            }
        }
    },
    dataF: function(elem) {
        let photo = elem.closest('li').children[0].children[0].children[0].getAttribute('src');
        let user = elem.closest('li').children[0].children[1].textContent;
        return {'userName':user,'photo':photo};
    },
    listUpdate: function (listL,listR) {
        this.listRight.innerHTML = myHbsRight(listR);
        this.listLeft.innerHTML = myHbsLeft(listL);
    },
    check: function (full, chunk) {
        return (full.toLowerCase().indexOf(chunk.toLowerCase()) === -1) ? false : true;
    }
}

function handleDragEnter(e) {
    e.preventDefault();
    return true;
}
function handleDragOver(e) {
    e.preventDefault();
    return true;
}
function handleDragDrop(e) {
    let data = JSON.parse(e.dataTransfer.getData('text/html'));
    let blockPos = e.target.closest('ul').classList[1];
    if(blockPos ==='list-user-left' && blockPos !==data[0]){
        myModuleApi.deleteU(data[1].userName,listRightStart.list);
        myModuleApi.addU(data[1],userListLeft.list)
    }
    if (blockPos ==='list-user-right' && blockPos !==data[0]) {
        myModuleApi.deleteU(data[1].userName,userListLeft.list);
        myModuleApi.addU(data[1],listRightStart.list)
    }
    let eventL = new Event("keyup");
    let eventR = new Event("keyup");
    myModuleApi.searchLeft.dispatchEvent(eventL);
    myModuleApi.searchRight.dispatchEvent(eventR);
    myModuleApi.listUpdate(sortingLeft,sortingRight);
    return false;
}

function go(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', JSON.stringify([e.target.closest('ul').classList[1],myModuleApi.dataF(e.target)]))
}

let listRightStart = {list:[]}, userListLeft = {list:[]}, sortingLeft = {list:[]}, sortingRight = {list:[]};

userListLeft = localStorage.dataL ? JSON.parse(localStorage.dataL) : userListLeft;
listRightStart =localStorage.dataInfo ? JSON.parse(localStorage.dataInfo) : listRightStart;
sortingLeft.list = userListLeft.list;
sortingRight.list = listRightStart.list;
myModuleApi.listUpdate(sortingLeft,sortingRight);

myModuleApi.friendContent.addEventListener('click',function (e) {
    let leftElem = e.target.closest('.add'),
        rightElem = e.target.closest('.delete'),
        eventL = new Event("keyup"),
        eventR = new Event("keyup");
    if(leftElem){
        let data = myModuleApi.dataF(leftElem);
        myModuleApi.deleteU(data.userName,userListLeft.list);
        myModuleApi.addU(data,listRightStart.list)
    }
    if(rightElem){
        let data = myModuleApi.dataF(rightElem);
        myModuleApi.deleteU(data.userName,listRightStart.list);
        myModuleApi.addU(data,userListLeft.list)
    }
    myModuleApi.searchLeft.dispatchEvent(eventL);
    myModuleApi.searchRight.dispatchEvent(eventR);
    myModuleApi.listUpdate(sortingLeft, sortingRight);
})
myModuleApi.listLeft.addEventListener('dragover',handleDragOver, false);
myModuleApi.listLeft.addEventListener('drop',handleDragDrop, false);
myModuleApi.listLeft.addEventListener('dragenter',handleDragEnter, false);
myModuleApi.listRight.addEventListener('dragover',handleDragOver, false);
myModuleApi.listRight.addEventListener('drop',handleDragDrop, false);
myModuleApi.listRight.addEventListener('dragenter',handleDragEnter, false);

myModuleApi.saveList.addEventListener('click',function () {
    localStorage.dataL = JSON.stringify(userListLeft);
    localStorage.dataInfo = JSON.stringify(listRightStart);
})

myModuleApi.friendContent.addEventListener('mousedown',function (e) {
    if(e.target.closest('li')){
        e.target.closest('li').addEventListener('dragstart', go, false);
    }
})

myModuleApi.searchLeft.addEventListener('keyup', function (e) {
    sortingLeft.list = [];
    if(e.target.value.length){
        for (let i = 0; i < userListLeft.list.length; i++) {
            if(myModuleApi.check(userListLeft.list[i].userName,e.target.value)){
                sortingLeft.list.push(userListLeft.list[i]);
            }
        }
        myModuleApi.listUpdate(sortingLeft,sortingRight);
    }else {
        sortingLeft.list = userListLeft.list
        myModuleApi.listUpdate(sortingLeft,sortingRight);
    }
})

myModuleApi.searchRight.addEventListener('keyup', function (e) {
    sortingRight.list = [];
    if(e.target.value.length){
        for (let i = 0; i < listRightStart.list.length; i++) {
            if(myModuleApi.check(listRightStart.list[i].userName,e.target.value)){
                sortingRight.list.push(listRightStart.list[i]);
            }
        }
        myModuleApi.listUpdate(sortingLeft,sortingRight);
    }else {
        sortingRight.list = listRightStart.list
        myModuleApi.listUpdate(sortingLeft,sortingRight);
    }
})

window.onload = myModuleApi.init();