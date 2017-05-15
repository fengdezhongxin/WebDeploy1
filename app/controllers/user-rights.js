/**
 * 用户权限配置
 */
class userRights {
    constructor(info) {
        this.userRoles = info.userRoles; //用户权限
        this.needRoles = info.needRoles; //使用需要的权限
        this.fn = info.fn; //回调函数
        this.isAccess(); //访问函数
    }
    isAccess() {
        let flag = false;
        this.userRoles.forEach(x => {
            if (this.needRoles.indexOf(x) !== -1) {
                flag = true;
            }
        })
        this.fn(flag);
    }
}
module.exports = userRights;
