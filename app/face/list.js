/**
 * Created by yanggang on 2017/3/6.
 */
import React from 'react';
import Config from 'config';
import {Link} from 'react-router-dom';
import {Layout, Modal, Card, Icon, Breadcrumb, Button, Row, Col, Upload} from 'antd';
import {FaceStore, FaceActions} from './reflux.js';
import './index.less';
const {Header, Content} = Layout;
const {Meta} = Card;
export default class FaceList extends React.Component {
    constructor(props) {
        super(props);
        this.unsubscribe = FaceStore.listen(this.onStatusChange.bind(this));
        this.state = {
            fileList: [],
            group_id: props.match.params.group_id,
            user_id: props.match.params.user_id,
            items: [],
            deleteBtnEnable: false,
            newItem: {}
        };
    }

    componentDidMount() {
        FaceActions.list(this.state.group_id, this.state.user_id);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange = (type, data) => {
        if (type === 'list') {
            this.setState({items: data.list, deleteBtnEnable: false, total: data.total});
        }
        if (type === 'delete') {
            FaceActions.list(this.state.group_id, this.state.user_id);
        }
    };

    // 显示添加组的弹窗
    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    // 取消添加组的弹窗
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    };
    // 上传图片
    uploadChange = () => {
        // 刷新列表
        FaceActions.list(this.state.group_id, this.state.user_id);
        // 隐藏弹窗
        this.setState({visible: false});
    };

    onRemoveFace=(face_token)=>{
        FaceActions.delete(face_token);
    };

    render() {
        const uploadButton = (
            <div>
                <Icon type="plus"/>
                <div className="ant-upload-text">Upload</div>
            </div>
        );

        return (<Layout className="face">
                <Breadcrumb className="breadcrumb">
                    <Breadcrumb.Item>人像库</Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={'/main/user/' + this.state.group_id}>人像库管理</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>用户列表</Breadcrumb.Item>
                </Breadcrumb>

                <Layout className="list-content">
                    <Header className="list-header">
                        <Button type="primary" onClick={this.showModal}>添加人像</Button>
                        <Button type="primary"
                                style={{marginLeft: 16}}>批量添加</Button>
                    </Header>
                    <Content >
                        <div style={{display: 'flex', flexWrap: 'wrap', background:'#fbfbfb', padding:8}}>
                            {
                                this.state.items.map((item, index) => {
                                    return <div className="face-item" key={item.face_token}>

                                        <img style={{
                                            height: 180,
                                            borderRadius: 5,
                                            border: 'solid 1px #eee'
                                        }}
                                             src={`${Config.server}/rest/face/v3/faceset/face/source/${item.face_token}`}
                                             ></img >
                                        <Icon type="delete" onClick={this.onRemoveFace.bind(this, item.face_token)} theme="filled" className="delete"  />
                                    </div>
                                })
                            }

                        </div>

                        <Modal
                            className="modify"
                            title="上传人像"
                            width={160}
                            visible={this.state.visible}
                            onOk={this.handleOk}
                            onCancel={this.handleCancel}
                            footer={null}
                        >

                            <Row >

                                <Col span={24}>
                                    <Upload
                                        showUploadList={false}
                                        action={Config.server + `/rest/face/v3/faceset/face/add?group_id=${this.state.group_id}&user_id=${this.state.user_id}`}
                                        listType="picture-card"
                                        onChange={this.uploadChange}
                                    >
                                        {uploadButton}
                                    </Upload>
                                </Col>
                            </Row>
                        </Modal>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}