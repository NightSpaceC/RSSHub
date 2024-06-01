const got = require('@/utils/got');
const cache = require('./cache');
const utils = require('./utils');
const logger = require('@/utils/logger');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const disableEmbed = ctx.params.disableEmbed;
    const cookie = await cache.getGuestCookieStr(ctx);
    const wbiImg = await cache.getWbiImg(ctx);
    const [name, face] = await cache.getUsernameAndFaceFromUID(ctx, uid);

    await got(`https://space.bilibili.com/${uid}`, {
        headers: {
            Referer: `https://www.bilibili.com/`,
            Cookie: cookie,
        },
    });
    const dmInfoQueryStr = utils.generateDmInfoQueryStr(['dm_img_list', 'dm_img_str', 'dm_cover_img_str', 'dm_img_inter'], config.bilibili.webglStr, config.bilibili.webglVendorAndRenderer, utils.generateLogStack());
    const wbiInfoQueryStr = utils.generateWbiInfoQueryStr(['w_rid', 'wts'], `mid=${uid}&pn=1&ps=25&index=1&order=pubdate&order_avoided=true&platform=web&web_location=1550101&${dmInfoQueryStr}`, wbiImg);
    const response = await got(`https://api.bilibili.com/x/space/wbi/arc/search?mid=${uid}&pn=1&ps=25&index=1&order=pubdate&order_avoided=true&platform=web&web_location=1550101&${dmInfoQueryStr}&${wbiInfoQueryStr}`, {
        headers: {
            Referer: `https://space.bilibili.com/${uid}`,
            Cookie: cookie,
        },
    });
    const data = response.data;
    if (data.code) {
        logger.error(JSON.stringify(data.data));
        throw new Error(`Got error code ${data.code} while fetching: ${data.message}`);
    }

    ctx.state.data = {
        title: `${name} 的 bilibili 空间`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 空间`,
        logo: face,
        icon: face,
        item:
            data.data &&
            data.data.list &&
            data.data.list.vlist &&
            data.data.list.vlist.map((item) => ({
                title: item.title,
                description: `${item.description}${disableEmbed ? '' : `<br><br>${utils.iframe(item.aid)}`}<br><img src="${item.pic}">`,
                pubDate: new Date(item.created * 1000).toUTCString(),
                link: item.created > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: name,
                comments: item.comment,
            })),
    };
};
