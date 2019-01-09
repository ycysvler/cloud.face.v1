import Reflux from 'reflux';
import Config from 'config';
import propx from '../http/proxy';

const UserActions = Reflux.createActions([
        'list',
        'add',
        'delete'
    ]
);

const UserStore = Reflux.createStore({
    listenables: [UserActions],

    //获取列表
    onList: function (group_id, pageIndex, pageSize) {
        let self = this;
        let start = (pageIndex -1) * pageSize;
        let url = Config.server + `/rest/face/v3/faceset/group/getusers?group_id=${group_id}&start=${start}&length=${pageSize}`;

        let param = {};

        propx.get(url, param, (code, data) => {
            let total = 0;
            // 没有数据
            if (data.statusCode === 404) {
                self.items = [];
            }
            else {
                self.items = data.user_id_list.items;
            }

            self.trigger('list', {total: data.user_id_list.total, list: self.items, param: param});
        });
    },

    onAdd:function(item){
        let self = this;
        let url = Config.server + "/rest/face/v3/faceset/user/add";

        let param = item;

        propx.post(url, param, (code, data) => {
            console.log(url, JSON.stringify(param));
            self.trigger('add', {data:data, param: param});
        });
    },

    onDelete:function(group_id, user_ids){
        let self = this;
        let url = Config.server + "/rest/face/v3/faceset/user/deleteids";

        let param ={group_id, user_ids};

        propx.delete(url, param, (code, data) => {
            console.log(url, JSON.stringify(param));
            self.trigger('delete', {data:data, param: param});
        });
    }

});


exports.UserActions = UserActions;
exports.UserStore = UserStore;