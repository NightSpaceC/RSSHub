const got = require('@/utils/got');
const utils = require('./utils');
const cheerio = require('cheerio');
const config = require('@/config').value;
const logger = require('@/utils/logger');

module.exports = {
    getGuestCookie: (ctx) => {
        const key = 'bili-cookie';
        return ctx.cache.tryGet(
            key,
            async () => await utils.getBilibiliCookie(config.ua)
            // Object.keys(cookie).map(key => `${key}=${cookie[key]}`).join('; ');
        );
    },
    getGuestCookieStr: async (ctx) => {
        const cookie = await module.exports.getGuestCookie(ctx);
        return Object.keys(cookie)
            .map((key) => `${key}=${cookie[key]}`)
            .join('; ');
    },
    getWbiImg: (ctx) => {
        const key = 'bili-wbi-img';
        return ctx.cache.tryGet(key, async () => {
            const cookie = await module.exports.getGuestCookie(ctx);
            return await utils.getWbiImg(config.ua, cookie.buvid3, cookie.b_nut, cookie.b_lsid, cookie._uuid, cookie.buvid_fp, cookie.buvid4);
        });
    },
    getUsernameFromUID: (ctx, uid) => {
        const key = 'bili-username-from-uid-' + uid;
        return ctx.cache.tryGet(key, async () => {
            const cookie = await module.exports.getGuestCookieStr(ctx);
            const wbiImg = await module.exports.getWbiImg(ctx);
            await got(`https://space.bilibili.com/${uid}/`, {
                headers: {
                    Referer: 'https://www.bilibili.com/',
                    Cookie: cookie,
                },
            });
            const dmInfoQueryStr = utils.generateDmInfoQueryStr(['dm_img_list', 'dm_img_str', 'dm_cover_img_str', 'dm_img_inter'], config.bilibili.webglStr, config.bilibili.webglVendorAndRenderer, utils.generateLogStack());
            const wbiInfoQueryStr = utils.generateWbiInfoQueryStr(['w_webid', 'w_rid', 'wts'], `mid=${uid}&token=&platform=web&web_location=1550101&${dmInfoQueryStr}`, wbiImg);
            const { data: nameResponse } = await got(`https://api.bilibili.com/x/space/wbi/acc/info?mid=${uid}&token=&platform=web&web_location=1550101&${dmInfoQueryStr}&${wbiInfoQueryStr}`, {
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                    Cookie: cookie,
                },
            });
            return nameResponse.data ? nameResponse.data.name : undefined;
        });
    },
    getUsernameAndFaceFromUID: async (ctx, uid) => {
        const nameKey = 'bili-username-from-uid-' + uid;
        const faceKey = 'bili-userface-from-uid-' + uid;
        let name = await ctx.cache.get(nameKey);
        let face = await ctx.cache.get(faceKey);
        if (!name || !face) {
            const cookie = await module.exports.getGuestCookieStr(ctx);
            const wbiImg = await module.exports.getWbiImg(ctx);
            await got(`https://space.bilibili.com/${uid}/`, {
                headers: {
                    Referer: 'https://www.bilibili.com/',
                    Cookie: cookie,
                },
            });
            const dmInfoQueryStr = utils.generateDmInfoQueryStr(['dm_img_list', 'dm_img_str', 'dm_cover_img_str', 'dm_img_inter'], config.bilibili.webglStr, config.bilibili.webglVendorAndRenderer, utils.generateLogStack());
            const wbiInfoQueryStr = utils.generateWbiInfoQueryStr(['w_webid', 'w_rid', 'wts'], `mid=${uid}&token=&platform=web&web_location=1550101&${dmInfoQueryStr}`, wbiImg);
            const { data: nameResponse } = await got(`https://api.bilibili.com/x/space/wbi/acc/info?mid=${uid}&token=&platform=web&web_location=1550101&${dmInfoQueryStr}&${wbiInfoQueryStr}`, {
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                    Cookie: cookie,
                },
            });
            if (nameResponse.data.name) {
                name = nameResponse.data.name;
                face = nameResponse.data.face;
            } else {
                logger.error(`Error when visiting /x/space/wbi/acc/info: ${JSON.stringify(nameResponse)}`);
            }
            ctx.cache.set(nameKey, name);
            ctx.cache.set(faceKey, face);
        }
        return [name, face];
    },
    getLiveIDFromShortID: (ctx, shortID) => {
        const key = `bili-liveID-from-shortID-${shortID}`;
        return ctx.cache.tryGet(key, async () => {
            const { data: liveIDResponse } = await got(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${shortID}`, {
                headers: {
                    Referer: `https://live.bilibili.com/${shortID}`,
                },
            });
            return liveIDResponse.data.room_id;
        });
    },
    getUsernameFromLiveID: (ctx, liveID) => {
        const key = `bili-username-from-liveID-${liveID}`;
        return ctx.cache.tryGet(key, async () => {
            const { data: nameResponse } = await got(`https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${liveID}`, {
                headers: {
                    Referer: `https://live.bilibili.com/${liveID}`,
                },
            });
            return nameResponse.data.info.uname;
        });
    },
    getVideoNameFromId: (ctx, aid, bvid) => {
        const key = `bili-videoname-from-id-${bvid || aid}`;
        return ctx.cache.tryGet(key, async () => {
            const { data } = await got(`https://api.bilibili.com/x/web-interface/view`, {
                searchParams: {
                    aid: aid || undefined,
                    bvid: bvid || undefined,
                },
                referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}`,
            });
            return data.data.title;
        });
    },
    getCidFromId: (ctx, aid, pid, bvid) => {
        const key = `bili-cid-from-id-${bvid || aid}-${pid}`;
        return ctx.cache.tryGet(key, async () => {
            const { data } = await got(`https://api.bilibili.com/x/web-interface/view?${bvid ? `bvid=${bvid}` : `aid=${aid}`}`, {
                referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}`,
            });
            return data.data.pages[pid - 1].cid;
        });
    },
    getAidFromBvid: async (ctx, bvid) => {
        const key = `bili-cid-from-bvid-${bvid}`;
        let aid = await ctx.cache.get(key);
        if (!aid) {
            const response = await got(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
                headers: {
                    Referer: `https://www.bilibili.com/video/${bvid}`,
                },
            });
            if (response.data && response.data.data && response.data.data.aid) {
                aid = response.data.data.aid;
            }
            ctx.cache.set(key, aid);
        }
        return aid;
    },
    getArticleDataFromCvid: async (ctx, cvid, uid) => {
        const url = `https://www.bilibili.com/read/cv${cvid}/`;
        const data = await ctx.cache.tryGet(
            url,
            async () =>
                (
                    await got({
                        method: 'get',
                        url,
                        headers: {
                            Referer: `https://space.bilibili.com/${uid}/`,
                        },
                    })
                ).data
        );
        const $ = cheerio.load(data);
        let description = $('#read-article-holder').html();
        if (!description) {
            try {
                const newFormatData = JSON.parse(
                    $('script:contains("window.__INITIAL_STATE__")')
                        .text()
                        .match(/window\.__INITIAL_STATE__\s*=\s*(.*?);\(/)[1]
                );

                if (newFormatData?.readInfo?.opus?.content?.paragraphs) {
                    description = '';
                    for (const element of newFormatData.readInfo.opus.content.paragraphs) {
                        if (element.para_type === 1) {
                            for (const text of element.text.nodes) {
                                if (text?.word?.words) {
                                    description += `<p>${text.word.words}</p>`;
                                }
                            }
                        }
                        if (element.para_type === 2) {
                            for (const image of element.pic.pics) {
                                description += `<p ><img src="${image.url}@progressive.webp"></p>`;
                            }
                        }
                        if (element.para_type === 3 && element.line?.pic?.url) {
                            description += `<figure><img src="${element.line.pic.url}"></figure>`;
                        }
                    }
                }
            } catch {
                /* empty */
            }
        }
        return { url, description };
    },
};
