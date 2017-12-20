const filterFriend = require('../filter-friend.hbs');
const myModuleApi = {

    allFriends: undefined,
    init: function () {
        let self = this;
        this.auth()
            .then(function() {
                self.getFriends('friends.get', { fields: 'city, country, photo_100' })
                    .then(function() {
                        self.renderAllFriends()
                    })
            }); 
    },
    auth: function () {
        return new Promise((resolve, reject) => {
            VK.init({
                apiId: 6301314
            });
            VK.Auth.login(data => {
                if (data.session) {
                    resolve();
                } else {
                    reject(new Error('Нет авторизации'))
                }
            }, 2);
        });
    },
    getFriends: function (method, params) {
        params.v = '5.69';
        return new Promise((resolve, reject) => {
            VK.api(method, params, (data) => {
                if (!data.error) {
                    this.allFriends = data.response;
                    resolve();
                } else {
                    reject(data.error);
                }
            });
        })
    },
    renderAllFriends: function() {
        const allFriend = filterFriend(this.allFriends);
        const target = document.querySelector('.filter-info__list');
        target.innerHTML = allFriend;
    }
};

window.onload = myModuleApi.init();