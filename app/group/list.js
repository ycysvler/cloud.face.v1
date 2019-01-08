/**
 * Created by yanggang on 2017/3/6.
 */
import React from 'react';
import {Link} from 'react-router-dom';
import {Layout,  Modal, Table, Breadcrumb, Button, Row, Col, Input} from 'antd';
import {FaceStore, FaceActions} from './reflux.js';
const {Header, Content} = Layout;

export default class FaceGroupList extends React.Component {
    constructor(props) {
        super(props);
        this.unsubscribe = FaceStore.listen(this.onStatusChange.bind(this));
        this.state = {items: [], deleteBtnEnable: false, newItem: {}};
    }

    componentDidMount() {
        FaceActions.list();
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
            FaceActions.list();
        }
        if (type === 'add') {
            FaceActions.list();
        }
    };

    deleteClick = () => {
        console.log('selectedRowKeys', this.state.selectedRowKeys);
        FaceActions.delete(this.state.selectedRowKeys);
    };

    columns = [
        {
            title: '编号',
            dataIndex: 'group_id',
            render: (text) => {return <Link to={"/main/user/" + text} >{text}</Link>},
        },
        {
            title: '名称',
            dataIndex: 'name',
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
        FaceActions.getList(pageNumber, 10);
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
        item.parentid = "0";
        FaceActions.add(item);
        this.setState({visible: false, newItem: {}});
    };
    // 取消添加组的弹窗
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    render() {
        return (<Layout>
                <Breadcrumb className="breadcrumb">
                    <Breadcrumb.Item>人像库</Breadcrumb.Item>
                    <Breadcrumb.Item>人像库管理</Breadcrumb.Item>
                </Breadcrumb>

                <Layout className="list-content">
                    <Header className="list-header">
                        <Button type="primary" onClick={this.showModal}>添加库</Button>
                        <Button type="danger" disabled={!this.state.deleteBtnEnable} onClick={this.deleteClick}
                                style={{marginLeft: 16}}>删除库</Button>
                    </Header>
                    <Content >
                        <Table
                            className="bg-white"
                            rowKey="group_id"
                            rowSelection={this.rowSelection} columns={this.columns} dataSource={this.state.items}
                            pagination={{
                                showSizeChanger: true,
                                onChange: this.onPageChange,
                                pageSizeOptions: ["2", "3", "4", "5"],
                                defaultPageSize: 10, total: this.state.total,
                                hideOnSinglePage: true
                            }} size="middle"/>

                        <Modal
                            className="modify"
                            title="新建分组"
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
                                        value={this.state.newItem.group_id}
                                        onChange={(e) => {
                                            let item = this.state.newItem;
                                            item.group_id = e.target.value;
                                            this.setState({newItem: item});
                                        }}/>
                                </Col>
                            </Row>
                            <Row><Col span={24}>&nbsp;</Col></Row>
                            <Row >
                                <Col offset={2} span={4} className="title">库名称</Col>
                                <Col offset={2} span={13}>
                                    <Input
                                        value={this.state.newItem.name}
                                        onChange={(e) => {
                                            let item = this.state.newItem;
                                            item.name = e.target.value;
                                            this.setState({newItem: item});
                                        }}/>
                                </Col>
                            </Row>
                            <Row><Col span={24}>&nbsp;</Col></Row>
                            <Row >
                                <Col offset={2} span={4} className="title">库描述</Col>
                                <Col offset={2} span={13}>
                                    <Input
                                        value={this.state.newItem.desc}
                                        onChange={(e) => {
                                            let item = this.state.newItem;
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