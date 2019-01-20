import React from 'react';
import {Layout, Menu, Button,Icon} from 'antd';
import {HashRouter as Router,Link, Switch, Route} from 'react-router-dom';
import NotFound from '../notfound';
import './main.less';

import GroupList from '../group/list';
import UserList from '../user/list';
import FaceList from '../face/list';

const SubMenu = Menu.SubMenu;
const {Header, Content, Sider} = Layout;

export default class CentrePlatform extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillUnmount() {

    }

    render=()=> {
        return (
            <Layout className="main-root">
                <Header style={{height:64}} className="header">
                    <div className="logo" >人像识别平台</div>
                    <div style={{float: 'right'}}>
                        <Layout style={{"background": "white"}}>
                            <Content>
                                <Menu mode="horizontal" >
                                    <SubMenu key="sub2" title={<span><Icon type="bulb" /><span>视频库管理</span></span>}>
                                        <Menu.Item key="monitor"><Link to='/main/video'><span>视频库</span></Link></Menu.Item>
                                    </SubMenu>
                                    <SubMenu key="sub1" title={<span><Icon type="appstore-o" /><span>人脸库管理</span></span>}>
                                        <Menu.Item key="org"><Link to='/main'><span>分组库</span></Link></Menu.Item>
                                    </SubMenu>
                                </Menu>
                            </Content>
                            <Sider width={160} className="box"
                                   style={{background: '#fff', height: '64px', justifyContent: 'flex-end'}}>
                                <Button style={{"background": "#fff", "border": "none"}} icon="question-circle-o"
                                        size="small" className="header-help">帮助</Button>
                            </Sider>
                        </Layout>
                    </div>
                </Header>
                <Layout >
                    <Router>
                        <Switch>
                            <Route path="/main" exact component={GroupList}/>
                            <Route path="/main/group"  component={GroupList}/>
                            <Route path="/main/user/:group_id"  component={UserList}/>
                            <Route path="/main/face/:group_id/:user_id"  component={FaceList}/>
                            <Route component={NotFound}/>

                        </Switch>
                    </Router>
                </Layout>
            </Layout>
        );
    }
}

