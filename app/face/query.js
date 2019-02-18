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
export default class FaceQuery extends React.Component {
    constructor(props) {
        super(props);
        this.unsubscribe = FaceStore.listen(this.onStatusChange.bind(this));
        this.state = {
            fileList: [],
            group_id: "22",
            items: [],
            deleteBtnEnable: false,
            newItem: {}
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange = (type, data) => {
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
    uploadChange = (e) => {
        if(e.file.response != null){
            // 隐藏弹窗
            this.setState({items:e.file.response.data.result, visible: false});
        }

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
                    <Breadcrumb.Item>人脸检索</Breadcrumb.Item>
                    <Breadcrumb.Item>检索</Breadcrumb.Item>
                </Breadcrumb>

                <Layout className="list-content">
                    <Header className="list-header">
                        <Button type="primary" onClick={this.showModal}>上传人像</Button>
                    </Header>
                    <Content >
                        <div style={{display: 'flex', flexWrap: 'wrap', background:'#fbfbfb', padding:8}}>
                            {
                                this.state.items.map((item, index) => {
                                    return <div className="face-item" key={item}>
                                        <img style={{
                                            height: 180,
                                            borderRadius: 5,
                                            border: 'solid 1px #eee'
                                        }}
                                             src={`${Config.server}/rest/face/v3/faceset/face/gsource/${this.state.group_id}/${item}`}
                                        ></img >
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
                                        action={Config.server + `/rest/face/v3/faceset/face/search?group_id=${this.state.group_id}`}
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