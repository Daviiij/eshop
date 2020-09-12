/*
 * @Date: 2020-07-01 15:01:13
 * @LastEditTime: 2020-09-11 19:33:29
 */

import React, { useEffect, useState } from 'react';
import { Tabs as TabsComp } from '@/components/r';
import { getList } from '@/services/app';
import Cookies from 'js-cookie';
import { Toast } from 'antd-mobile';
import classnames from 'classnames';

export default (props) => {
  const { history } = props;

  const [fix, setFix] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [data, setDataList] = useState([]);
  const [positionMap, setPositionMap] = useState({});

  useEffect(() => {
    _getList();
  }, []);

  useEffect(() => {
    if (!data || !data.length) return;
    let obj = {};
    _.map(data, (item) => {
      const y = Math.floor(
        document.getElementById(`${item.code}`).getBoundingClientRect().y
      );
      obj[y] = item.code;
    });
    setPositionMap(obj);
  }, [data]);

  const _getList = async () => {
    try {
      Toast.loading();
      const [err, data, msg] = await getList();
      Toast.hide();
      if (!err) {
        setDataList(
          data.map((item) => {
            item.key = item.code;
            item.title = item.name;
            return item;
          })
        );
      } else Toast.fail(msg, 1);
    } catch (error) {}
  };

  const eventScroll = (e) => {
    const position = e.target.scrollTop;
    const isFix = position > 140;
    setFix(isFix);

    const rp = _.find(_.keys(positionMap), (p) => Math.abs(position - p) < 20);
    const code = positionMap[rp];
    if (code) {
      const index = _.findIndex(data, (item) => item.code === code);
      setActiveTab(index);
    } else if (!isFix) {
      setActiveTab(0);
    }
  };

  const scrollToAnchor = (tab, anchorName) => {
    if (tab) {
      // 找到锚点
      const anchorElement = document.getElementById(tab.key);
      // setActiveTab(anchorName);
      // 如果对应id的锚点存在，就跳转到锚点
      if (anchorElement) {
        anchorElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }
  };

  const toItem = (bizType, brandCode) => {
    window.location.href =
      bizType === 2
        ? `/credit.html#/?brandCode=${brandCode}`
        : `/card.html#/?brandCode=${brandCode}`;
  };

  return (
    <div className="home" onScroll={eventScroll}>
      <div className="home__img-wrap">
        <div className="home__img-wrap-img"></div>
      </div>
      <div className="home__content-wrap">
        <TabsComp
          className={classnames('home__content-wrap-tabs', {
            'home__content-wrap-tabs--fix': fix,
          })}
          activeTab={activeTab}
          onTabClick={scrollToAnchor}
          data={data}
          page={4}
        />
        {fix ? <div className="home__content-wrap-tabs--block"></div> : null}
        <div className="home__content-wrap-list">
          {_.map(data, (item, index) => (
            <div className="home__card" key={index}>
              <div
                id={item.key}
                className="home__card-anchor"
                onScrollCapture={(e) => console.log(1)}
              ></div>
              <div className="home__card-title">
                <img
                  className="home__card-title-icon"
                  src={'/file' + item.iconUrl}
                />
                <span className="home__card-title-text">{item.title}</span>
              </div>
              <ul className="home__card-brand">
                {_.map(item.brandList, (item) => (
                  <li
                    className="home__card-brand-item"
                    key={item.code}
                    onClick={() => toItem(item.bizType, item.code)}
                  >
                    {item.tags && (
                      <div className="home__card-brand-item-tags">
                        {item.tags}
                      </div>
                    )}
                    <img
                      className="home__card-brand-item-img"
                      src={'/file' + item.iconUrl}
                    />
                    <span className="home__card-brand-item-name">
                      {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
    // </>
  );
};
