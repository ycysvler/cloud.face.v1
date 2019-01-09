/**
 * Created by yanggang on 2017/3/6.
 */
import React from 'react';
import {Link} from 'react-router-dom';
import {Layout,  Modal, Table, Breadcrumb, Button, Row, Col, Input} from 'antd';
import {UserStore, UserActions} from './reflux.js';
const {Header, Content} = Layout;

export default class FaceUserList extends React.Component {
    constructor(props) {
        super(props);
        this.unsubscribe = UserStore.listen(this.onStatusChange.bind(this));
        this.state = {group_id:props.match.params.group_id, items: [], deleteBtnEnable: false, newItem: {}};
    }

    componentDidMount() {
        UserActions.list(this.state.group_id,1,10);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange = (type, data) => {
        if (type === 'list') {
            console.log('items', data);
            this.setState({items: data.list, deleteBtnEnable: false, total: data.total});
        }
        if (type === 'delete') {
            UserActions.list(this.state.group_id,1,10);
        }
        if (type === 'add') {
            UserActions.list(this.state.group_id,1,10);
        }
    };

    deleteClick = () => {
        console.log('selectedRowKeys', this.state.selectedRowKeys);
        UserActions.delete(this.state.group_id, this.state.selectedRowKeys);
    };

    columns = [
        {
            title: '编号',
            dataIndex: 'user_id',
            render: (text,item) => {return <Link to={"/main/face/" + item.group_id + "/" + item.user_id } >{text}</Link>},
        },
        {
            title: '描述',
            dataIndex: 'desc',
        },
        {
            title: '更新时间',
            dataIndex: 'updatetime',
        }];

    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            this.state.selectedRowKeys = selectedRowKeys;
            if (selectedRowKeys.length > 0) {
                this.setState({deleteBtnEnable: true, selectedRowKeys: selectedRowKeys});
            } else {
                this.setState({deleteBtnEnable: false, selectedRowKeys: selectedRowKeys});
            }
        },
        onSelect: (record, selected, selectedRows) => {
            console.log(record, selected, selectedRows);
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
            console.log(selected, selectedRows, changeRows);
        },
        getCheckboxProps: record => ({
            disabled: record.key === '3',
        }),
    };

    onPageChange = (pageNumber) => {
        UserActions.list(this.state.group_id,pageNumber, 10);
    };

    // 显示添加组的弹窗
    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    // 确定添加组的弹窗
    handleOk = (e) => {
        let item = this.state.newItem;
        UserActions.add(item);
        this.setState({visible: false, newItem: {}});
    };
    // 取消添加组的弹窗
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    };

    render() {
        return (<Layout>
                <Breadcrumb className="breadcrumb">
                    <Breadcrumb.Item>人像库</Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={'/main/group'}>人像库管理</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>用户列表</Breadcrumb.Item>
                </Breadcrumb>

                <Layout className="list-content">
                    <Header className="list-header">
                        <Button type="primary" onClick={this.showModal}>添加用户</Button>
                        <Button type="danger" disabled={!this.state.deleteBtnEnable} onClick={this.deleteClick}
                                style={{marginLeft: 16}}>删除用户</Button>
                    </Header>
                    <Content >
                        <Table
                            className="bg-white"
                            rowKey="user_id"
                            rowSelection={this.rowSelection} columns={this.columns} dataSource={this.state.items}
                            pagination={{
                                onChange: this.onPageChange,
                                 total: this.state.total,
                                hideOnSinglePage: true
                            }} size="middle"/>

                        <Modal
                            className="modify"
                            title="添加用户"
                            visible={this.state.visible}
                            onOk={this.handleOk}
                            onCancel={this.handleCancel}
                            footer={[
                                <Button key="submit" type="primary" onClick={this.handleOk}>
                                    确认
                                </Button>,
                                <Button key="back" onClick={this.handleCancel}>取消</Button>,
                            ]}
                        >
                            <Row >
                                <Col offset={2} span={4} className="title">编号</Col>
                                <Col offset={2} span={13}>
                                    <Input
                                        value={this.state.newItem.user_id}
                                        onChange={(e) => {
                                            let item = this.state.newItem;
                                            item.group_id = this.state.group_id;
                                            item.user_id = e.target.value;
                                            this.setState({newItem: item});
                                        }}/>
                                </Col>
                            </Row>
                            <Row><Col span={24}>&nbsp;</Col></Row>
                            <Row >
                                <Col offset={2} span={4} className="title">描述</Col>
                                <Col offset={2} span={13}>
                                    <Input
                                        value={this.state.newItem.desc}
                                        onChange={(e) => {
                                            let item = this.state.newItem;
                                            item.group_id = this.state.group_id;
                                            item.desc = e.target.value;
                                            this.setState({newItem: item});
                                        }}/>
                                </Col>
                            </Row>
                        </Modal>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}