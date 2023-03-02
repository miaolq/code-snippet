import React, { PureComponent } from 'react'
import { Modal, Button, message } from 'antd'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Zone from './Zone'

class HotZone extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      zoneList: [],
      init: null,
    }
    this.mouseDownX = 0
    this.mouseDownY = 0
    this.x = 0 // 热区左上角坐标
    this.y = 0 // 热区左上角坐标
    this.width = 0 // 热区宽度
    this.height = 0
    this.isMouseDown = false
    this.zoneInstanceList = []
    this.minLength = 20
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.zoneList !== nextProps.zoneList) {
      this.setState({ zoneList: this.toPxZoneList(nextProps.zoneList) })
    }
  }

  componentDidUpdate() {
    if (this.state.visible) {
      window.addEventListener('mousemove', this.onMouseMove)
      window.addEventListener('mouseup', this.onMouseUp)
    } else {
      window.removeEventListener('mousemove', this.onMouseMove)
      window.removeEventListener('mouseup', this.onMouseUp)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
  }

  onImgLoad = () => {
    this.setState(
      {
        init: this.ref.getBoundingClientRect(),
      },
      () => {
        this.setState({
          zoneList: this.toPxZoneList(this.props.zoneList),
        })
      }
    )
  }

  onMouseDown = (e) => {
    e.stopPropagation()
    if (e.target !== this.imgRef) {
      return
    }
    const { clientX, clientY, offsetX, offsetY } = e.nativeEvent
    this.mouseDownX = clientX
    this.mouseDownY = clientY
    this.x = offsetX
    this.y = offsetY
    this.isMouseDown = true
  }

  onMouseMove = (e) => {
    this.zoneInstanceList.forEach((item) => {
      item.onMouseMove(e)
    })
    if (!this.isMouseDown) {
      return
    }
    const { clientX, clientY } = e
    const { width: maxWidth, height: maxHeight } = this.state.init
    let deltaX = clientX - this.mouseDownX
    deltaX = deltaX > 0 ? deltaX : 0
    let deltaY = clientY - this.mouseDownY
    deltaY = deltaY > 0 ? deltaY : 0
    const sumX = this.x + deltaX
    const sumY = this.y + deltaY
    this.width = sumX > maxWidth ? maxWidth - this.x : deltaX
    this.height = sumY > maxHeight ? maxHeight - this.y : deltaY
    this.zoneRef.style.cssText = `display:block; left:${this.x}px; top:${this.y}px; width:${this.width}px; height:${this.height}px`
  }

  onMouseUp = () => {
    this.zoneInstanceList.forEach((item) => {
      item.onMouseUp()
    })
    if (!this.isMouseDown) {
      return
    }
    const { zoneList } = this.state
    // 宽和高超过limit时加入
    if (this.width > this.minLength && this.height > this.minLength) {
      this.setState({
        zoneList: [
          ...zoneList,
          {
            left: this.x,
            top: this.y,
            width: this.width,
            height: this.height,
            key: Date.now(),
            link: '',
            _blank: false,
          },
        ],
      })
    }
    this.reset()
  }

  onDragEnd = (index, obj) => {
    const { width: maxWidth, height: maxHeight } = this.state.init
    this.setState({
      zoneList: this.state.zoneList.map((item, i) => {
        if (i === index) {
          let { left, top } = item
          const { width, height } = item
          const { x, y } = obj
          const sumX = left + width + x
          const sumY = top + height + y
          const minX = left + x > 0 ? left + x : 0
          const minY = top + y > 0 ? top + y : 0
          left = sumX > maxWidth ? maxWidth - width : minX
          top = sumY > maxHeight ? maxHeight - height : minY
          return { ...item, left, top }
        }
        return item
      }),
    })
  }

  onDelete = (index) => {
    this.setState({
      zoneList: this.state.zoneList.filter((item, i) => {
        return index !== i
      }),
    })
    this.zoneInstanceList = this.zoneInstanceList.filter((item, i) => {
      return index !== i
    })
  }

  onOk = () => {
    const { zoneList } = this.state
    const isValid = zoneList.every((item, index) => {
      if (!item.link) {
        message.warning(`${index + 1}号热区的链接还没配置`)
      }
      return !!item.link
    })
    if (isValid) {
      this.props.onOk(this.toPercentZoneList(this.state.zoneList))
      this.toggleVisible()
    }
  }

  onCancel = () => {
    this.setState({
      zoneList: this.toPxZoneList(this.props.zoneList),
    })
    this.toggleVisible()
  }

  toPercentZoneList = (zoneList = []) => {
    return zoneList.map((item) => {
      const { left, top, width, height } = item
      return {
        ...item,
        left: this.toPercent(left, true),
        width: this.toPercent(width, true),
        top: this.toPercent(top, false),
        height: this.toPercent(height, false),
      }
    })
  }

  toPxZoneList = (zoneList = []) => {
    return zoneList.map((item) => {
      const { left, top, width, height } = item
      return {
        ...item,
        left: this.toPx(left, true),
        width: this.toPx(width, true),
        top: this.toPx(top, false),
        height: this.toPx(height, false),
      }
    })
  }

  toPercent = (l, isWidth) => {
    const { width: maxWidth, height: maxHeight } = this.state.init
    const t = isWidth ? maxWidth : maxHeight
    return `${((l / t) * 100).toFixed(3)}%`
  }

  toPx = (l, isWidth) => {
    const { width: maxWidth, height: maxHeight } = this.state.init
    const t = isWidth ? maxWidth : maxHeight
    return (Number.parseInt(l.replace('%', ''), 10) / 100) * t
  }

  reset = () => {
    this.mouseDownX = 0
    this.mouseDownY = 0
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
    this.isMouseDown = false
    this.zoneRef.style.cssText = 'display:none;'
  }

  toggleVisible = () => {
    this.setState({
      visible: !this.state.visible,
    })
  }

  addZoneInstance = (zone) => {
    this.zoneInstanceList.push(zone)
  }

  changeZone = (zone, index) => {
    this.setState({
      zoneList: this.state.zoneList.map((item, i) => {
        if (i === index) {
          return { ...item, ...zone } // 保留key
        }
        return item
      }),
    })
  }

  render() {
    const { visible, zoneList, init } = this.state
    let maxWidth = 0
    let maxHeight = 0
    if (init) {
      maxWidth = init.width
      maxHeight = init.height
    }
    const { src = 'https://miro.medium.com/max/1200/1*6v0VjyiKNaLp0ounI3pNbA.jpeg' } = this.props
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="cube-hotzone-wrapper">
          <Button onClick={this.toggleVisible}>热区编辑</Button>
          <Modal
            maskClosable={false}
            width={800}
            onOk={this.onOk}
            onCancel={this.onCancel}
            visible={visible}
            className="cube-hotzone-modal"
          >
            <div className="wrapper">
              <div className="wrapper-left">
                <div
                  draggable={false}
                  className="img-wrapper"
                  ref={(ref) => {
                    this.ref = ref
                  }}
                  onMouseDown={this.onMouseDown}
                >
                  <img
                    onLoad={this.onImgLoad}
                    ref={(ref) => {
                      this.imgRef = ref
                    }}
                    draggable={false}
                    className="cube-hotzone-img"
                    src={src}
                    alt=""
                  />
                  {zoneList.map((item, index) => {
                    return (
                      <Zone
                        changeZone={this.changeZone}
                        addZoneInstance={this.addZoneInstance}
                        onDelete={this.onDelete}
                        key={item.key}
                        index={index}
                        minLength={this.minLength}
                        maxWidth={maxWidth}
                        maxHeight={maxHeight}
                        onDragEnd={this.onDragEnd}
                        data={item}
                      />
                    )
                  })}
                  <div
                    key={-1}
                    ref={(ref) => {
                      this.zoneRef = ref
                    }}
                    style={{ display: 'none' }}
                    className="cube-hotzone-zone"
                  />
                </div>
              </div>
              <div className="wrapper-right">
                {zoneList.map((item, index) => {
                  return (
                    <div className="zone-block" key={item.key}>
                      <div>热区{index + 1}</div>
                      <div>
                        链接：
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          {item.link}
                        </a>
                      </div>
                      <div>是否打开新页面：{item._blank ? '是' : '否'}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Modal>
        </div>
      </DndProvider>
    )
  }
}
export default HotZone
