import React, { useEffect, useState } from 'react';
import unTime from '@/assets/images/unTime.png';
import { SvgIcon } from '@/components/r';
import BScroll from '@better-scroll/core';
import { getOrderWithDetailByOrderId } from '@/services/app';
import { getQueryVariable } from '@/utils';
import { Toast, Modal } from 'antd-mobile';
import {
  KAMI_TYPE_1,
  KAMI_TYPE_2,
  KAMI_TYPE_3,
  PRODUCT_TYPE_1,
  PRODUCT_TYPE_2,
  PRODUCT_TYPE_3,
} from '@/const';
import * as QrCode from 'qrcode.react';

export default (props) => {
  const { history } = props;
  const [visible, setVisible] = useState(false);
  const [list, setList] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    new BScroll('.card__list', {
      probeType: 3,
      click: true,
      bounce: false,
      preventDefault: false,
    });
  }, [list]);

  useEffect(() => {
    initList();
  }, []);

  useEffect(() => {
    if (_.isEmpty(items)) return;
    setVisible(true);
  }, [items]);

  const initList = async () => {
    try {
      const [err, data, msg] = await getOrderWithDetailByOrderId({
        orderId: getQueryVariable('orderId'),
      });
      if (!err) setList(data);
      else Toast.fail(msg, 1);
    } catch (error) {}
  };

  const codeVisible = (item) => {
    setItems(item);
  };

  const onWrapTouchStart = (e) => {
    // fix touch to scroll background page on iOS
    if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
      return;
    }
    const pNode = closest(e.target, '.am-modal-content');
    if (!pNode) {
      e.preventDefault();
    }
  };

  const TypeMap = {
    [KAMI_TYPE_1]: (item, index) => {
      if (item.productTypeCode === 101) return;
      return (
        <div onClick={() => codeVisible(item.orderDetailList[index])}>
          <SvgIcon iconClass="qrCode" />
        </div>
      );
    },
    [KAMI_TYPE_2]: () => {
      return (
        <div className="unTime">
          <img src={unTime} />
        </div>
      );
    },
    // [KAMI_TYPE_3]: (item) => {
    //   return (
    //     <div className="unTime">
    //       {/* <img src={unTime} /> */}
    //     </div>
    //   );
    // },
  };

  const ProductTypesMap = {
    [PRODUCT_TYPE_1]: (item) => {
      return (
        <>
          <div
            className={
              item.status === KAMI_TYPE_2 || item.status === KAMI_TYPE_3
                ? 'graytexts'
                : 'texts'
            }
            style={{ marginTop: '20SUPX', fontSize: '25SUPX' }}
          >
            <div>
              卡号：<b>{item.objNo}</b>
            </div>
            <div>
              密码：<b>{item.password}</b>
            </div>
          </div>
        </>
      );
    },
    [PRODUCT_TYPE_2]: (item) => {
      return (
        <div
          className={
            item.status === KAMI_TYPE_2 || item.status === KAMI_TYPE_3
              ? 'graytexts'
              : 'texts'
          }
        >
          兑换码：<b>{item.password}</b>
        </div>
      );
    },
    [PRODUCT_TYPE_3]: (item) => {
      return (
        <div
          className={
            item.status === KAMI_TYPE_2 || item.status === KAMI_TYPE_3
              ? 'graytexts'
              : 'texts'
          }
        >
          短链接：<b>{item.password}</b>
        </div>
      );
    },
  };
  return (
    <div className="card">
      <div className="card__head">{list.goodsName}</div>
      <div className="card__list">
        <ul>
          {_.map(list.orderDetailList, (item, index) => (
            <li key={index} className="card__list-item">
              <div className="card__list-item-info">
                <img
                  src={`/file${list.iconUrl}`}
                  className={
                    item.status === KAMI_TYPE_2 || item.status === KAMI_TYPE_3
                      ? 'grayimg'
                      : 'img'
                  }
                />
                <div className="right">
                  <span
                    className={
                      item.status === KAMI_TYPE_2 || item.status === KAMI_TYPE_3
                        ? 'graytitle'
                        : 'title'
                    }
                  >
                    {item.goodsName}
                  </span>
                  <span
                    className={
                      item.status === KAMI_TYPE_2 || item.status === KAMI_TYPE_3
                        ? 'graytime'
                        : 'time'
                    }
                  >
                    有效期至 {item.invalidTime}
                  </span>
                </div>
              </div>
              <div className="card__list-item-code">
                {ProductTypesMap[list.productTypeCode](item)}
              </div>
              {TypeMap[list.orderDetailList[index].status] &&
                TypeMap[item.status](list, index)}
            </li>
          ))}
        </ul>
      </div>

      <div className="card__btn">
        <div
          className="card__btn-1"
          onClick={() => (window.location.href = '/order.html')}
        >
          查看订单
        </div>
        {/* <div
          className="card__btn-2"
          onClick={() => (window.location.href = '/es.html#/home')}
        >
          继续购买
        </div> */}
      </div>

      <div className="card__block"></div>

      <div className="card__html">
        <div className="card__html-title">
          <span className="card__html-title-line after"></span>
          <span className="card__html-title-text">使用须知</span>
          <span className="card__html-title-line before"></span>
        </div>
        <div
          className="card__html-content"
          dangerouslySetInnerHTML={{
            __html: list.usageIllustration,
          }}
        />
      </div>
      {/* <div className="modal"> */}
      <Modal
        visible={visible}
        transparent
        closable
        maskClosable={false}
        onClose={() => setVisible(false)}
        title={<div className="modal-title">{items.goodsName}</div>}
        wrapProps={{ onTouchStart: onWrapTouchStart }}
        afterClose={() => setItems([])}
        className="modal"
      >
        <div>
          <div className="modal-text">付款时请向店员出示二维码</div>
          <QrCode value={items.password} size={100} id="qrCode" />
          <div className="modal-pwd">
            {list?.productTypeCode &&
              ProductTypesMap[list.productTypeCode](items)}
          </div>
        </div>
      </Modal>
      {/* </div> */}
    </div>
  );
};
