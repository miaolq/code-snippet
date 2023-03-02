import React, { PureComponent } from 'react';
import { DragSource } from 'react-dnd';
import { Icon, Form, Input, Switch, Modal } from 'antd';
import cls from 'classnames';

const dragEvent = {
  beginDrag(props) {
    return props;
  },
  endDrag(props, monitor) {
    props.onDragEnd(props.index, monitor.getDifferenceFromInitialOffset());
  },
};

const dragCollect = (connect) => {
  return {
    connectDragSource: connect.dragSource(),
  };
};

class Zone extends PureComponent {
  constructor(props) {
    super(props);
    this.x = 0;
    this.y = 0;
    this.isMouseDown = false;
    const { link, _blank } = this.props.data;
    this.state = {
      deltaX: 0,
      deltaY: 0,
      link,
      _blank,
      visible: false,
    };
  }

  componentDidMount() {
    this.props.addZoneInstance(this);
  }

  onMouseDown = (e) => {
    e.stopPropagation();
    this.isMouseDown = true;
    const { clientX, clientY } = e;
    this.x = clientX;
    this.y = clientY;
  };

  onMouseMove = (e) => {
    if (!this.isMouseDown) {
      return;
    }
    const { clientX, clientY } = e;
    this.setState({
      deltaX: clientX - this.x,
      deltaY: clientY - this.y,
    });
  };

  onMouseUp = () => {
    if (!this.isMouseDown) {
      return;
    }
    this.props.changeZone(this.getNewWidthHeight(), this.props.index);
    this.setState({
      deltaX: 0,
      deltaY: 0,
    });
    this.isMouseDown = false;
    this.x = 0;
    this.y = 0;
  };

  onOk = () => {
    const { link, _blank } = this.state;
    this.props.changeZone({ link, _blank }, this.props.index);
    this.toggleModal();
  };

  onCancel = () => {
    const { link, _blank } = this.props.data;
    this.setState({ link, _blank });
    this.toggleModal();
  };

  getNewWidthHeight = () => {
    const { minLength, maxWidth, maxHeight } = this.props;
    const { deltaX, deltaY } = this.state;
    let { width, height } = this.props.data;
    width = width + deltaX > minLength ? width + deltaX : minLength;
    height = height + deltaY > minLength ? height + deltaY : minLength;
    // 校验超出
    const { left, top } = this.props.data;
    const sumX = left + width;
    const sumY = top + height;
    width = sumX > maxWidth ? maxWidth - left : width;
    height = sumY > maxHeight ? maxHeight - top : height;
    return {
      width,
      height,
    };
  };

  toggleModal = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  render() {
    const { width, height } = this.getNewWidthHeight();
    const { left, top } = this.props.data;
    const { link, _blank, visible } = this.state;
    const { connectDragSource, onDelete, index } = this.props;
    const style = {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
    return (
      <div style={style} className={cls('cube-hotzone-zone', { 'cube-hotzone-zone-none': link })}>
        {connectDragSource(
          <div onClick={this.toggleModal} className="cube-hotzone-zone-handle">
            {index + 1}单击编辑
          </div>
        )}
        <Icon onClick={() => onDelete(index)} className="cube-hotzone-zone-delete" type="delete" />
        <span draggable={false} onMouseDown={this.onMouseDown} className="cube-hotzone-zone-ball" />
        <Modal visible={visible} onOk={this.onOk} onCancel={this.onCancel} title="热区设置" maskClosable={false}>
          <div>
            <Form.Item label="链接">
              <Input
                value={link}
                onChange={(e) => {
                  this.setState({ link: e.target.value });
                }}
              />
            </Form.Item>
            <Form.Item label="在新页面打开">
              <Switch
                checked={_blank}
                onChange={(val) => {
                  this.setState({ _blank: val });
                }}
              />
            </Form.Item>
          </div>
        </Modal>
      </div>
    );
  }
}
export default DragSource('HOTZONE', dragEvent, dragCollect)(Zone);
